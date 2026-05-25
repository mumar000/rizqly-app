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
const EDITABLE = new Set([
  "name",
  "amount",
  "category",
  "bank_account",
  "frequency",
  "nextDueDate",
  "reminderEnabled",
]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (EDITABLE.has(key)) update[key] = value;
    }

    if (update.amount !== undefined) {
      if (typeof update.amount !== "number" || update.amount <= 0) {
        return NextResponse.json(
          { error: "Amount must be a positive number" },
          { status: 400 },
        );
      }
    }
    if (update.frequency !== undefined && !VALID_FREQ.has(update.frequency as string)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }
    if (
      update.nextDueDate !== undefined &&
      !/^\d{4}-\d{2}-\d{2}$/.test(update.nextDueDate as string)
    ) {
      return NextResponse.json(
        { error: "nextDueDate must be YYYY-MM-DD" },
        { status: 400 },
      );
    }
    if (typeof update.name === "string") update.name = update.name.trim();
    if (typeof update.bank_account === "string") {
      update.bank_account = (update.bank_account as string).trim();
    }

    await dbConnect();
    const doc = await Bill.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      update,
      { new: true },
    ).lean();

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(formatBill(doc as Record<string, unknown>));
  } catch (error) {
    console.error("[PATCH /api/bills/:id]", error);
    return NextResponse.json({ error: "Could not update bill" }, { status: 500 });
  }
}

export async function DELETE(
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
    const deleted = await Bill.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/bills/:id]", error);
    return NextResponse.json({ error: "Could not delete bill" }, { status: 500 });
  }
}
