export interface Transaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive for inflow, negative for outflow
  category: string;
  type: 'inflow' | 'outflow';
}

export interface ReportData {
  title: string;
  currency: string;
  currencySymbol: string;
  startDate: string;
  endDate: string;
  transactions: Transaction[];
}

export const DEMO_NAIRA_REPORT: ReportData = {
  title: "Private Report · demo01Sample",
  currency: "NGN",
  currencySymbol: "₦",
  startDate: "2021-01-26",
  endDate: "2026-11-23",
  transactions: [
    // 2021
    { date: "2021-02-15", description: "Northstar Studio - Project Retainer", amount: 4500000, category: "Contract", type: "inflow" },
    { date: "2021-03-10", description: "Market basket - Groceries & Supplies", amount: -450000, category: "Groceries", type: "outflow" },
    { date: "2021-04-12", description: "Home - Monthly Rent Payment", amount: -1500000, category: "Rent", type: "outflow" },
    { date: "2021-06-20", description: "Digital services - Cloud Infrastructure", amount: -120000, category: "Technology", type: "outflow" },
    { date: "2021-08-05", description: "Northstar Studio - Milestone 1", amount: 3800000, category: "Contract", type: "inflow" },
    { date: "2021-10-18", description: "Travel fund - Flight bookings", amount: -600000, category: "Travel", type: "outflow" },

    // 2022
    { date: "2022-01-11", description: "Fieldwork Labs - Design Consult", amount: 1200000, category: "Consulting", type: "inflow" },
    { date: "2022-03-15", description: "Market basket - Quarterly Restock", amount: -850000, category: "Groceries", type: "outflow" },
    { date: "2022-05-22", description: "Home - Property Maintenance & Repairs", amount: -1800000, category: "Rent", type: "outflow" },
    { date: "2022-07-30", description: "Northstar Studio - Milestone 2", amount: 4800000, category: "Contract", type: "inflow" },
    { date: "2022-09-14", description: "Digital services - Software Licenses", amount: -180000, category: "Technology", type: "outflow" },
    { date: "2022-11-05", description: "Travel fund - Hotel accommodation", amount: -750000, category: "Travel", type: "outflow" },

    // 2023
    { date: "2023-01-25", description: "Northstar Studio - Q1 Advance", amount: 5000000, category: "Contract", type: "inflow" },
    { date: "2023-04-10", description: "Market basket - Office Pantry", amount: -950000, category: "Groceries", type: "outflow" },
    { date: "2023-06-15", description: "Home - Annual Rent Renewal", amount: -2200000, category: "Rent", type: "outflow" },
    { date: "2023-08-20", description: "Fieldwork Labs - Technical Strategy", amount: 1800000, category: "Consulting", type: "inflow" },
    { date: "2023-10-12", description: "Digital services - Premium API Keys", amount: -220000, category: "Technology", type: "outflow" },
    { date: "2023-12-05", description: "Travel fund - Year-end retreat", amount: -900000, category: "Travel", type: "outflow" },

    // 2024
    { date: "2024-02-18", description: "Northstar Studio - Retainer Renewal", amount: 5500000, category: "Contract", type: "inflow" },
    { date: "2024-05-12", description: "Market basket - Corporate Catering", amount: -1100000, category: "Groceries", type: "outflow" },
    { date: "2024-07-22", description: "Home - Security Upgrades", amount: -2500000, category: "Rent", type: "outflow" },
    { date: "2024-09-15", description: "Fieldwork Labs - UX Audit Support", amount: 1300000, category: "Consulting", type: "inflow" },
    { date: "2024-11-08", description: "Digital services - Enterprise Cloud", amount: -280000, category: "Technology", type: "outflow" },
    { date: "2024-12-20", description: "Travel fund - Holiday flights", amount: -400000, category: "Travel", type: "outflow" },

    // 2025
    { date: "2025-02-28", description: "Northstar Studio - Annual Project Wrap", amount: 5700000, category: "Contract", type: "inflow" },
    { date: "2025-05-14", description: "Market basket - Weekly Supplies", amount: -1050000, category: "Groceries", type: "outflow" },
    { date: "2025-07-19", description: "Home - Renovation Project", amount: -1500000, category: "Rent", type: "outflow" },
    { date: "2025-09-10", description: "Fieldwork Labs - Platform Launch", amount: 1300000, category: "Consulting", type: "inflow" },
    { date: "2025-10-25", description: "Digital services - Subscription Renewals", amount: -150000, category: "Technology", type: "outflow" },
    { date: "2025-12-15", description: "Travel fund - Ski Resort Stay", amount: -500000, category: "Travel", type: "outflow" },

    // 2026
    { date: "2026-02-10", description: "Northstar Studio - New Venture Fee", amount: -1400000, category: "Investment", type: "outflow" }, // Let's keep total inflow clean
    { date: "2026-03-05", description: "Northstar Studio - Contract Advance", amount: 3600000, category: "Contract", type: "inflow" },
    { date: "2026-05-20", description: "Market basket - Final Stock", amount: -1100000, category: "Groceries", type: "outflow" },
    { date: "2026-07-15", description: "Home - Landscaping", amount: -1000000, category: "Rent", type: "outflow" },
    { date: "2026-09-12", description: "Digital services - Database Hosting", amount: -150000, category: "Technology", type: "outflow" },
    { date: "2026-11-23", description: "Travel fund - Autumn Journey", amount: -250000, category: "Travel", type: "outflow" },
  ]
};

export const DEMO_USD_REPORT: ReportData = {
  title: "Corporate Treasury · US-Midwest LLC",
  currency: "USD",
  currencySymbol: "$",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  transactions: [
    { date: "2024-01-15", description: "Stripe Payout - SaaS Subscriptions", amount: 48500, category: "Sales", type: "inflow" },
    { date: "2024-01-20", description: "AWS Cloud Hosting Billing", amount: -4200, category: "Infrastructure", type: "outflow" },
    { date: "2024-02-10", description: "WeWork - Private Office Monthly Rent", amount: -2500, category: "Rent", type: "outflow" },
    { date: "2024-02-28", description: "Acme Corp - Enterprise License Fee", amount: 15000, category: "Enterprise", type: "inflow" },
    { date: "2024-03-15", description: "Stripe Payout - SaaS Subscriptions", amount: 52100, category: "Sales", type: "inflow" },
    { date: "2024-03-25", description: "Google Workspace & GSuite Services", amount: -450, category: "Software", type: "outflow" },
    { date: "2024-04-18", description: "Upwork Global - Freelance Engineers", amount: -8900, category: "Engineering", type: "outflow" },
    { date: "2024-05-15", description: "Stripe Payout - SaaS Subscriptions", amount: 58400, category: "Sales", type: "inflow" },
    { date: "2024-05-22", description: "AWS Cloud Hosting Billing", amount: -4600, category: "Infrastructure", type: "outflow" },
    { date: "2024-06-10", description: "WeWork - Private Office Monthly Rent", amount: -2500, category: "Rent", type: "outflow" },
    { date: "2024-07-15", description: "Stripe Payout - SaaS Subscriptions", amount: 61000, category: "Sales", type: "inflow" },
    { date: "2024-08-05", description: "Vercel Inc - Hosting and DNS", amount: -350, category: "Infrastructure", type: "outflow" },
    { date: "2024-08-25", description: "Upwork Global - QA & Support Team", amount: -6500, category: "Engineering", type: "outflow" },
    { date: "2024-09-15", description: "Stripe Payout - SaaS Subscriptions", amount: 64500, category: "Sales", type: "inflow" },
    { date: "2024-10-10", description: "WeWork - Private Office Monthly Rent", amount: -2500, category: "Rent", type: "outflow" },
    { date: "2024-10-22", description: "HubSpot - CRM Annual License Renewal", amount: -5800, category: "Software", type: "outflow" },
    { date: "2024-11-15", description: "Stripe Payout - SaaS Subscriptions", amount: 68900, category: "Sales", type: "inflow" },
    { date: "2024-12-05", description: "AWS Cloud Hosting Billing", amount: -4900, category: "Infrastructure", type: "outflow" },
    { date: "2024-12-20", description: "Delta Airlines - Executive Offsite", amount: -3200, category: "Travel", type: "outflow" }
  ]
};

export const DEMO_EUR_REPORT: ReportData = {
  title: "Private Portfolio · Berlin Ventures",
  currency: "EUR",
  currencySymbol: "€",
  startDate: "2023-01-01",
  endDate: "2023-12-31",
  transactions: [
    { date: "2023-01-10", description: "Mitte Co-working Space Rent", amount: -1200, category: "Rent", type: "outflow" },
    { date: "2023-02-15", description: "Advisory Service - Seed Investment", amount: 25000, category: "Advisory", type: "inflow" },
    { date: "2023-03-20", description: "Gusto Catering Services", amount: -850, category: "Food", type: "outflow" },
    { date: "2023-04-12", description: "Deutsche Bahn - Business Travel", amount: -240, category: "Travel", type: "outflow" },
    { date: "2023-05-18", description: "Venture Payout - Portfolio Dividend", amount: 45000, category: "Dividends", type: "inflow" },
    { date: "2023-06-25", description: "Mitte Co-working Space Rent", amount: -1200, category: "Rent", type: "outflow" },
    { date: "2023-07-14", description: "Digital Marketing Ads (Google)", amount: -3500, category: "Marketing", type: "outflow" },
    { date: "2023-08-30", description: "Tax Advisor Consultation Fee", amount: -1800, category: "Legal & Tax", type: "outflow" },
    { date: "2023-10-05", description: "Venture Payout - Portfolio Dividend", amount: 35000, category: "Dividends", type: "inflow" },
    { date: "2023-11-12", description: "Mitte Co-working Space Rent", amount: -1200, category: "Rent", type: "outflow" },
    { date: "2023-12-18", description: "Lufthansa - Conference Travel", amount: -650, category: "Travel", type: "outflow" }
  ]
};
