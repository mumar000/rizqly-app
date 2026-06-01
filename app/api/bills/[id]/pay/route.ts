import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb/mongoose";
import { Bank, Bill, Transaction } from "@/lib/mongodb/models";
import { advanceDueDate, isPaidForCurrentCycle } from "@/services/bill.service";

function formatBill(doc: Record<string, unknown>) {
  const out = { ...doc };
  if (out._id) {
    out.id = (out._id as { toString(): string }).toString();
    delete out._id;
  }
  if (out.createdAt) {
    out.created_at = out.createdAt;
    delete out.createdAt;
  }
  if (out.updatedAt) {
    out.updated_at = out.updatedAt;
    delete out.updatedAt;
  }
  delete out.userId;
  delete out.__v;
  return out;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await dbConnect();

    const bill = await Bill.findOne({ _id: id, userId: session.user.id });
    if (!bill) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Idempotency: never double-charge for the same cycle.
    if (isPaidForCurrentCycle(bill)) {
      return NextResponse.json(
        {
          error:
            bill.frequency === "one_off"
              ? "This bill has already been paid"
              : "Already paid this cycle",
          code: "ALREADY_PAID",
        },
        { status: 409 },
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // Log a system-sourced expense for this payment.
    const tx = await Transaction.create({
      userId: session.user.id,
      direction: "expense",
      amount: bill.amount,
      description: bill.name,
      bank_account: bill.bank_account,
      category: bill.category || "Bills",
      date: today,
      sourceType: "system",
      rawInput: `bill:${bill._id.toString()}`,
    });

    // Reflect the spend on the bank balance.
    await Bank.findOneAndUpdate(
      { userId: session.user.id, name: bill.bank_account },
      { $inc: { balance: -bill.amount } },
    );

    // Advance the schedule (one-off bills stay put; UI can delete them after pay).
    bill.lastPaidAt = today;
    if (bill.frequency !== "one_off") {
      bill.nextDueDate = advanceDueDate(bill.nextDueDate, bill.frequency);
    }
    await bill.save();

    return NextResponse.json({
      bill: formatBill(bill.toObject() as Record<string, unknown>),
      transactionId: tx._id.toString(),
    });
  } catch (error) {
    console.error("[POST /api/bills/:id/pay]", error);
    return NextResponse.json({ error: "Could not mark paid" }, { status: 500 });
  }
}
