"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/store/currency-store";

export function CurrencyInitializer() {
  const { setRates, setLoading } = useCurrencyStore();

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("/api/currency/rates");
        const data = await res.json();
        setRates(data);
      } catch (err) {
        console.error("Failed to fetch rates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
    const interval = setInterval(fetchRates, 60_000);
    return () => clearInterval(interval);
  }, [setRates, setLoading]);

  return null;
}