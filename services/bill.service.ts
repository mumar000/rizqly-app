export type BillFrequency = "one_off" | "weekly" | "monthly" | "yearly";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  bank_account: string;
  frequency: BillFrequency;
  nextDueDate: string;
  reminderEnabled: boolean;
  lastPaidAt: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBillInput {
  name: string;
  amount: number;
  category: string;
  bankAccount: string;
  frequency: BillFrequency;
  nextDueDate: string;
  reminderEnabled?: boolean;
}

export interface UpdateBillInput {
  name?: string;
  amount?: number;
  category?: string;
  bankAccount?: string;
  frequency?: BillFrequency;
  nextDueDate?: string;
  reminderEnabled?: boolean;
}

const BASE_URL = "/api/bills";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function toBody(input: Partial<CreateBillInput & UpdateBillInput>) {
  const body: Record<string, unknown> = { ...input };
  if ("bankAccount" in input) {
    body.bank_account = input.bankAccount;
    delete body.bankAccount;
  }
  return body;
}

export const billService = {
  async getAll(): Promise<Bill[]> {
    return handleResponse<Bill[]>(await fetch(BASE_URL));
  },

  async create(input: CreateBillInput): Promise<Bill> {
    return handleResponse<Bill>(
      await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBody(input)),
      })
    );
  },

  async update(id: string, input: UpdateBillInput): Promise<Bill> {
    return handleResponse<Bill>(
      await fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBody(input)),
      })
    );
  },

  async delete(id: string): Promise<void> {
    await handleResponse<void>(
      await fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
    );
  },

  async markPaid(id: string): Promise<{ bill: Bill; transactionId: string }> {
    return handleResponse(
      await fetch(`${BASE_URL}/${id}/pay`, { method: "POST" })
    );
  },
};

/** Pure helpers used by the UI — no React. */

export function daysUntil(iso: string, today: Date = new Date()): number {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return Infinity;
  const startA = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startB = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.round((startB.getTime() - startA.getTime()) / 86400000);
}

export function advanceDueDate(iso: string, frequency: BillFrequency): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "one_off":
      return iso;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type UrgencyBand = "overdue" | "this_week" | "later";

export function urgencyBand(days: number): UrgencyBand {
  if (days < 0) return "overdue";
  if (days <= 7) return "this_week";
  return "later";
}

/**
 * Single source of truth for "is this bill already settled for its current cycle?"
 * Used by both the server pay route (to reject duplicate payments) and the
 * client (to disable the Mark-paid button + show a Paid badge).
 *
 * Logic: after payment, `lastPaidAt` is set and (for recurring) `nextDueDate`
 * has been advanced. As long as today is still before that advanced date,
 * the cycle that just ended has been paid. One-off bills are paid forever
 * once `lastPaidAt` is set.
 *
 * Accepts a structural subset so callers don't need the full Bill shape.
 */
export interface PayableLike {
  frequency: BillFrequency;
  nextDueDate: string;
  lastPaidAt: string | null;
}

export function isPaidForCurrentCycle(
  bill: PayableLike,
  today: Date = new Date(),
): boolean {
  if (!bill.lastPaidAt) return false;
  if (bill.frequency === "one_off") return true;

  const next = new Date(bill.nextDueDate);
  if (Number.isNaN(next.getTime())) return false;

  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const n = new Date(next.getFullYear(), next.getMonth(), next.getDate());
  return t.getTime() < n.getTime();
}
