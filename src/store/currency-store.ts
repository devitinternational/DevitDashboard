import { create } from "zustand";

type Currency = "INR" | "MYR";

type Rates = {
  INR_TO_MYR: number;
  MYR_TO_INR: number;
  fetchedAt: number;
};

type CurrencyStore = {
  currency: Currency;
  rates: Rates | null;
  loading: boolean;
  toggle: () => void;
  setRates: (rates: Rates) => void;
  setLoading: (loading: boolean) => void;
  convert: (amountINR: number) => number;
  format: (amountINR: number) => string;
};

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  currency: "INR",
  rates: null,
  loading: true,

  toggle: () =>
    set((s) => ({ currency: s.currency === "INR" ? "MYR" : "INR" })),

  setRates: (rates) => set({ rates }),
  setLoading: (loading) => set({ loading }),

  convert: (amountINR) => {
    const { currency, rates } = get();
    if (currency === "INR" || !rates) return amountINR;
    return Number((amountINR * rates.INR_TO_MYR).toFixed(2));
  },

  format: (amountINR) => {
    const { currency, rates } = get();
    if (currency === "INR") {
      return `₹${amountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    }
    if (!rates) return `₹${amountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    const myr = Number((amountINR * rates.INR_TO_MYR).toFixed(2));
    return `RM ${myr.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;
  },
}));