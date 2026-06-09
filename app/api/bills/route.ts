import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb/mongoose";
import { Bill } from "@/lib/mongodb/models";

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

const VALID_FREQ = new Set(["one_off", "weekly", "monthly", "yearly"]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const docs = await Bill.find({ userId: session.user.id })
      .sort({ nextDueDate: 1 })
      .lean();
    return NextResponse.json(docs.map((d) => formatBill(d as Record<string, unknown>)));
  } catch (error) {
    console.error("[GET /api/bills]", error);
    return NextResponse.json({ error: "Could not fetch bills" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, amount, bank_account, frequency, nextDueDate } = body;
    const category = body.category || "Bills";

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required", field: "name" },
        { status: 400 },
      );
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number", field: "amount" },
        { status: 400 },
      );
    }
    if (!bank_account?.trim()) {
      return NextResponse.json(
        { error: "Bank account is required", field: "bank_account" },
        { status: 400 },
      );
    }
    if (!frequency || !VALID_FREQ.has(frequency)) {
      return NextResponse.json(
        { error: "Frequency must be one_off, weekly, monthly or yearly", field: "frequency" },
        { status: 400 },
      );
    }
    if (!nextDueDate || !/^\d{4}-\d{2}-\d{2}$/.test(nextDueDate)) {
      return NextResponse.json(
        { error: "nextDueDate must be YYYY-MM-DD", field: "nextDueDate" },
        { status: 400 },
      );
    }

    await dbConnect();

    const clientId =
      typeof body.clientId === "string" && body.clientId.length > 0
        ? body.clientId
        : null;

    if (clientId) {
      const existing = await Bill.findOne({
        userId: session.user.id,
        clientId,
      });
      if (existing) {
        return NextResponse.json(
          formatBill(existing.toObject() as Record<string, unknown>),
          { status: 200 },
        );
      }
    }

    const doc = await Bill.create({
      userId: session.user.id,
      clientId,
      name: name.trim(),
      amount,
      category,
      bank_account: bank_account.trim(),
      frequency,
      nextDueDate,
      reminderEnabled: body.reminderEnabled ?? true,
    });

    return NextResponse.json(
      formatBill(doc.toObject() as Record<string, unknown>),
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/bills]", error);
    return NextResponse.json({ error: "Could not create bill" }, { status: 500 });
  }
}
