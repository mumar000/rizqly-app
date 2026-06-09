import React from "react";

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

/**
 * Minimal line icons for transaction categories. No emojis.
 * Each icon takes its color from the `color` prop via `currentColor`.
 */
function FoodIcon() {
  return (
    <>
      <path d="M4 3v6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3" />
      <path d="M7 12v9" />
      <path d="M17 3a4 4 0 0 0-4 4v4h4Z" />
      <path d="M17 11v10" />
    </>
  );
}

function TransportIcon() {
  return (
    <>
      <path d="M5 17h14v-5l-2-5H7l-2 5v5Z" />
      <circle cx="8" cy="17.5" r="1.5" />
      <circle cx="16" cy="17.5" r="1.5" />
    </>
  );
}

function ShoppingIcon() {
  return (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  );
}

function BillsIcon() {
  return (
    <>
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v4h4" />
      <path d="M10 12h6" />
      <path d="M10 16h4" />
    </>
  );
}

function EntertainmentIcon() {
  return (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M7 5v4" />
      <path d="M17 5v4" />
      <path d="M7 15v4" />
      <path d="M17 15v4" />
    </>
  );
}

function HealthIcon() {
  return (
    <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" />
  );
}

function EducationIcon() {
  return (
    <>
      <path d="M3 5l9-3 9 3-9 3-9-3Z" />
      <path d="M7 7v5c0 1.5 2.2 3 5 3s5-1.5 5-3V7" />
      <path d="M21 5v6" />
    </>
  );
}

function GroceriesIcon() {
  return (
    <>
      <path d="M3 6h2l2 11h11l2-8H7" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </>
  );
}

function OtherIcon() {
  return (
    <>
      <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </>
  );
}

function SalaryIcon() {
  return (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </>
  );
}

function FreelanceIcon() {
  return <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />;
}

function TransferIcon() {
  return (
    <>
      <path d="M3 8h14l-3-3" />
      <path d="M14 5l3 3" />
      <path d="M21 16H7l3 3" />
      <path d="M10 19l-3-3" />
    </>
  );
}

function DepositIcon() {
  return (
    <>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v10h14V10" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
    </>
  );
}

function RefundIcon() {
  return (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </>
  );
}

function GiftIcon() {
  return (
    <>
      <rect x="3" y="8" width="18" height="13" rx="1" />
      <path d="M3 12h18" />
      <path d="M12 8v13" />
      <path d="M12 8a3 3 0 0 1-3-3 2 2 0 0 1 3-2 2 2 0 0 1 3 2 3 3 0 0 1-3 3Z" />
    </>
  );
}

function PaidBackIcon() {
  return (
    <>
      <path d="M3 12c0-5 4-8 9-8s9 3 9 8-4 8-9 8c-2 0-4-.5-5.5-1.5" />
      <path d="M3 21v-5h5" />
    </>
  );
}

function SparkleIcon() {
  return (
    <>
      <path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5L12 4Z" />
      <path d="M19 18l.5 1.5L21 20l-1.5.5L19 22l-.5-1.5L17 20l1.5-.5L19 18Z" />
    </>
  );
}

function HomeIcon() {
  return (
    <>
      <path d="M3 10l9-7 9 7v11H3V10Z" />
      <path d="M9 21v-7h6v7" />
    </>
  );
}

function RepeatIcon() {
  return (
    <>
      <path d="M3 12V8a3 3 0 0 1 3-3h13" />
      <path d="M16 2l3 3-3 3" />
      <path d="M21 12v4a3 3 0 0 1-3 3H5" />
      <path d="M8 22l-3-3 3-3" />
    </>
  );
}

function WifiIcon() {
  return (
    <>
      <path d="M2 8.82a15 15 0 0 1 20 0" />
      <path d="M5 12.86a10 10 0 0 1 14 0" />
      <path d="M8.5 16.43a5 5 0 0 1 7 0" />
      <path d="M12 20h.01" />
    </>
  );
}

function BoltIcon() {
  return <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />;
}

function PhoneIcon() {
  return (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M11 19h2" />
    </>
  );
}

function ShieldIcon() {
  return <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />;
}

const ICON_MAP: Record<string, () => React.ReactNode> = {
  // Expense categories
  Food: FoodIcon,
  Transport: TransportIcon,
  Shopping: ShoppingIcon,
  Bills: BillsIcon,
  Entertainment: EntertainmentIcon,
  Health: HealthIcon,
  Education: EducationIcon,
  Groceries: GroceriesIcon,
  Other: OtherIcon,

  // Income categories
  Salary: SalaryIcon,
  "Freelance / Gig": FreelanceIcon,
  Transfer: TransferIcon,
  "Cash Deposit": DepositIcon,
  Refund: RefundIcon,
  Gift: GiftIcon,
  "Paid Back": PaidBackIcon,

  // Bill-specific categories
  Rent: HomeIcon,
  Subscription: RepeatIcon,
  Internet: WifiIcon,
  Utilities: BoltIcon,
  Phone: PhoneIcon,
  Insurance: ShieldIcon,
};

export function CategoryIcon({
  name,
  className = "w-5 h-5",
  color,
  strokeWidth = 1.8,
}: CategoryIconProps) {
  const Render = ICON_MAP[name] ?? ICON_MAP.Other;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={color ? { color } : undefined}
      aria-hidden="true"
    >
      {Render()}
    </svg>
  );
}

/**
 * Single source of truth for whether we have a real icon for a category.
 * Useful if you ever want to gracefully degrade.
 */
export function hasCategoryIcon(name: string): boolean {
  return name in ICON_MAP;
}
