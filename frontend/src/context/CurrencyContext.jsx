import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

// Standard exchange rate: 1 USD = 83 INR
export const EXCHANGE_RATE_USD_TO_INR = 83;

export function CurrencyProvider({ children }) {
  // Read saved preference from localStorage, default to INR
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('marketverse_currency') || 'INR';
  });

  const setCurrency = (curr) => {
    setCurrencyState(curr);
    localStorage.setItem('marketverse_currency', curr);
  };

  const toggleCurrency = () => {
    const next = currency === 'INR' ? 'USD' : 'INR';
    setCurrency(next);
  };

  /**
   * Converts a base USD amount to the selected currency
   */
  const convertAmount = (amountInUSD, targetCurrency = currency) => {
    const val = Number(amountInUSD) || 0;
    if (targetCurrency === 'INR') {
      return Math.round(val * EXCHANGE_RATE_USD_TO_INR);
    }
    return val;
  };

  /**
   * Formats a base USD amount into the primary active currency string
   * Example: "₹2,499" or "$29.99"
   */
  const formatPrice = (amountInUSD) => {
    const val = Number(amountInUSD) || 0;
    if (currency === 'INR') {
      const inrVal = Math.round(val * EXCHANGE_RATE_USD_TO_INR);
      return `₹${inrVal.toLocaleString('en-IN')}`;
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  /**
   * Formats a base USD amount into the secondary (opposite) currency string
   * Example: if currency is INR, returns "$29.99"; if USD, returns "₹2,499"
   */
  const formatSecondaryPrice = (amountInUSD) => {
    const val = Number(amountInUSD) || 0;
    if (currency === 'INR') {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const inrVal = Math.round(val * EXCHANGE_RATE_USD_TO_INR);
    return `₹${inrVal.toLocaleString('en-IN')}`;
  };

  /**
   * Formats dual price displaying BOTH INR and USD
   * Example: "₹2,499 ($29.99)" or "$29.99 (₹2,499)"
   */
  const formatDualPrice = (amountInUSD, separator = ' ') => {
    const primary = formatPrice(amountInUSD);
    const secondary = formatSecondaryPrice(amountInUSD);
    return `${primary}${separator}(${secondary})`;
  };

  const formatUSD = (amountInUSD) => {
    const val = Number(amountInUSD) || 0;
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatINR = (amountInUSD) => {
    const val = Number(amountInUSD) || 0;
    const inrVal = Math.round(val * EXCHANGE_RATE_USD_TO_INR);
    return `₹${inrVal.toLocaleString('en-IN')}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        rate: EXCHANGE_RATE_USD_TO_INR,
        formatPrice,
        formatSecondaryPrice,
        formatDualPrice,
        formatUSD,
        formatINR,
        convertAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
