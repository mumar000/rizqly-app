# Budget Tracker - Supabase Setup

Run this SQL in your Supabase SQL Editor to create the expenses table:

```sql
-- Drop existing table if you want a fresh start (OPTIONAL - removes all data!)
-- DROP TABLE IF EXISTS budget_expenses;

-- Create budget_expenses table (simplified, no auth required for testing)
CREATE TABLE IF NOT EXISTS budget_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  bank_account TEXT NOT NULL DEFAULT 'Cash',
  raw_input TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_budget_expenses_created_at
ON budget_expenses(created_at DESC);

-- Enable RLS but allow all operations for now (for testing)
ALTER TABLE budget_expenses ENABLE ROW LEVEL SECURITY;

-- Allow all operations (temporary policy for testing without auth)
CREATE POLICY "Allow all operations" ON budget_expenses
  FOR ALL USING (true) WITH CHECK (true);

-- Optional: Insert sample data
-- INSERT INTO budget_expenses (amount, description, category, bank_account, raw_input) VALUES
--   (500, 'Ice Cream', 'Food', 'Meezan Bank', '500rs ice cream from meezan'),
--   (1200, 'Pizza', 'Food', 'HBL', '1200 pizza from hbl'),
--   (300, 'Coffee', 'Food', 'JazzCash', '300rs coffee jazzcash');
```

## Steps:

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a "New Query"
4. Paste the SQL above
5. Click "Run"

## Verify:

After running, go to "Table Editor" and you should see the `budget_expenses` table.
