"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  bank_account: string;
  category: string;
  created_at: string;
  raw_input: string;
}

export interface MonthlyStats {
  totalSpent: number;
  byCategory: Record<string, number>;
  byBank: Record<string, number>;
  expenses: Expense[];
}

// For backwards compatibility with local storage
interface LocalExpense {
  id: string;
  amount: number;
  description: string;
  bankAccount: string;
  category: string;
  createdAt: string;
  rawInput: string;
}

const STORAGE_KEY = "rizqly_expenses";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useSupabase, setUseSupabase] = useState(true);

  // Check if Supabase is configured
  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && url.length > 0 && key && key.length > 0;
  };

  // Fetch expenses from Supabase
  const fetchFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from("budget_expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Supabase fetch error:", err);
      throw err;
    }
  };

  // Load from localStorage (fallback)
  const loadFromLocalStorage = (): Expense[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const localExpenses: LocalExpense[] = JSON.parse(stored);
        // Convert local format to Supabase format
        return localExpenses.map((e) => ({
          id: e.id,
          amount: e.amount,
          description: e.description,
          bank_account: e.bankAccount,
          category: e.category,
          created_at: e.createdAt,
          raw_input: e.rawInput,
        }));
      }
    } catch (err) {
      console.error("LocalStorage load error:", err);
    }
    return [];
  };

  // Save to localStorage
  const saveToLocalStorage = (expenses: Expense[]) => {
    try {
      const localExpenses: LocalExpense[] = expenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        description: e.description,
        bankAccount: e.bank_account,
        category: e.category,
        createdAt: e.created_at,
        rawInput: e.raw_input,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localExpenses));
    } catch (err) {
      console.error("LocalStorage save error:", err);
    }
  };

  // Load expenses on mount
  useEffect(() => {
    const loadExpenses = async () => {
      setIsLoading(true);
      setError(null);

      if (isSupabaseConfigured()) {
        try {
          const data = await fetchFromSupabase();
          setExpenses(data);
          setUseSupabase(true);
        } catch (err) {
          console.warn("Falling back to localStorage");
          setExpenses(loadFromLocalStorage());
          setUseSupabase(false);
          setError("Using offline mode - Supabase not available");
        }
      } else {
        setExpenses(loadFromLocalStorage());
        setUseSupabase(false);
      }

      setIsLoading(false);
    };

    loadExpenses();
  }, []);

  // Add new expense
  const addExpense = useCallback(
    async (expense: {
      amount: number;
      description: string;
      bankAccount: string;
      category: string;
      rawInput: string;
    }) => {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        amount: expense.amount,
        description: expense.description,
        bank_account: expense.bankAccount,
        category: expense.category,
        created_at: new Date().toISOString(),
        raw_input: expense.rawInput,
      };

      // Optimistic update
      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);

      if (useSupabase && isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("budget_expenses")
            .insert({
              amount: expense.amount,
              description: expense.description,
              category: expense.category,
              bank_account: expense.bankAccount,
              raw_input: expense.rawInput,
            })
            .select()
            .single();

          if (error) throw error;

          // Update with actual ID from Supabase
          if (data) {
            setExpenses((prev) =>
              prev.map((e) => (e.id === newExpense.id ? data : e)),
            );
          }
        } catch (err) {
          console.error("Failed to save to Supabase:", err);
          // Keep optimistic update but save to localStorage as backup
          saveToLocalStorage(updatedExpenses);
          setError("Saved locally - will sync when online");
        }
      } else {
        saveToLocalStorage(updatedExpenses);
      }

      return newExpense;
    },
    [expenses, useSupabase],
  );

  // Delete expense
  const deleteExpense = useCallback(
    async (id: string) => {
      const updatedExpenses = expenses.filter((e) => e.id !== id);
      setExpenses(updatedExpenses);

      if (useSupabase && isSupabaseConfigured()) {
        try {
          const { error } = await supabase
            .from("budget_expenses")
            .delete()
            .eq("id", id);

          if (error) throw error;
        } catch (err) {
          console.error("Failed to delete from Supabase:", err);
        }
      } else {
        saveToLocalStorage(updatedExpenses);
      }
    },
    [expenses, useSupabase],
  );

  // Clear all expenses
  const clearExpenses = useCallback(async () => {
    setExpenses([]);

    if (useSupabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("budget_expenses")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

        if (error) throw error;
      } catch (err) {
        console.error("Failed to clear Supabase:", err);
      }
    }
    saveToLocalStorage([]);
  }, [useSupabase]);

  // Get current month stats
  const getMonthlyStats = useCallback(
    (month?: Date): MonthlyStats => {
      const targetMonth = month || new Date();
      const monthStart = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        1,
      );
      const monthEnd = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      const monthlyExpenses = expenses.filter((e) => {
        const date = new Date(e.created_at);
        return date >= monthStart && date <= monthEnd;
      });

      const totalSpent = monthlyExpenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0,
      );

      const byCategory: Record<string, number> = {};
      const byBank: Record<string, number> = {};

      monthlyExpenses.forEach((e) => {
        byCategory[e.category] =
          (byCategory[e.category] || 0) + Number(e.amount);
        byBank[e.bank_account] =
          (byBank[e.bank_account] || 0) + Number(e.amount);
      });

      return {
        totalSpent,
        byCategory,
        byBank,
        expenses: monthlyExpenses,
      };
    },
    [expenses],
  );

  // Get recent expenses (last N)
  const getRecentExpenses = useCallback(
    (count: number = 5) => {
      return expenses.slice(0, count);
    },
    [expenses],
  );

  // Refresh from server
  const refresh = useCallback(async () => {
    if (useSupabase && isSupabaseConfigured()) {
      setIsLoading(true);
      try {
        const data = await fetchFromSupabase();
        setExpenses(data);
        setError(null);
      } catch (err) {
        setError("Failed to refresh");
      }
      setIsLoading(false);
    }
  }, [useSupabase]);

  return {
    expenses,
    isLoading,
    error,
    isOnline: useSupabase,
    addExpense,
    deleteExpense,
    clearExpenses,
    getMonthlyStats,
    getRecentExpenses,
    refresh,
  };
}
