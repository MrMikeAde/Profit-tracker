import * as XLSX from 'xlsx';
import type { Transaction, ReportData } from './demoData';

export interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'inflow' | 'outflow';
}

// Convert common Excel serial date format to YYYY-MM-DD
function parseExcelDate(serial: any): string {
  if (typeof serial === 'number') {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    const fractionalDay = serial - Math.floor(serial);
    let totalSeconds = Math.floor(86400 * fractionalDay);
    const seconds = totalSeconds % 60;
    totalSeconds -= seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds / 60) % 60;

    // adjust timezone offset
    const d = new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate(), hours, minutes, seconds);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Handle standard string formats
  if (typeof serial === 'string') {
    const cleaned = serial.trim();
    const parsed = Date.parse(cleaned);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    // Regex matches common dd/mm/yyyy or dd-mm-yyyy formats
    const match = cleaned.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})$/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
  }

  return new Date().toISOString().split('T')[0];
}

// Map transaction categories based on description words
export function guessCategory(description: string, amount: number): string {
  const descLower = (description || '').toLowerCase();

  if (amount > 0) {
    if (descLower.includes('salary') || descLower.includes('payroll') || descLower.includes('earn')) return 'Salary';
    if (descLower.includes('retainer') || descLower.includes('consult') || descLower.includes('project')) return 'Contract';
    if (descLower.includes('dividend') || descLower.includes('payout') || descLower.includes('yield')) return 'Dividends';
    if (descLower.includes('transfer') || descLower.includes('wire') || descLower.includes('credit')) return 'Inbound Transfer';
    return 'Other Income';
  } else {
    if (descLower.includes('uber') || descLower.includes('bolt') || descLower.includes('flight') || descLower.includes('airline') || descLower.includes('travel') || descLower.includes('trip') || descLower.includes('hotel')) return 'Travel';
    if (descLower.includes('rent') || descLower.includes('landlord') || descLower.includes('home') || descLower.includes('estate') || descLower.includes('apartment') || descLower.includes('security')) return 'Rent & Property';
    if (descLower.includes('supermarket') || descLower.includes('market') || descLower.includes('grocer') || descLower.includes('basket') || descLower.includes('food') || descLower.includes('restaurant') || descLower.includes('eat')) return 'Groceries & Dining';
    if (descLower.includes('aws') || descLower.includes('cloud') || descLower.includes('hosting') || descLower.includes('github') || descLower.includes('digital') || descLower.includes('vercel') || descLower.includes('software') || descLower.includes('api')) return 'Technology & SaaS';
    if (descLower.includes('ad') || descLower.includes('google') || descLower.includes('facebook') || descLower.includes('marketing') || descLower.includes('promo')) return 'Marketing';
    if (descLower.includes('tax') || descLower.includes('legal') || descLower.includes('consultant') || descLower.includes('audit')) return 'Professional Services';
    return 'Other Expenses';
  }
}

export function parseStatementFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return reject('No data loaded');
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to array of arrays first to make column mapping easy
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

// Function to map parsed rows to exact Transactions based on user column selection
export function createReportFromRows(
  fileName: string,
  rows: any[][],
  mapping: { dateIdx: number; descIdx: number; amtIdx: number; categoryIdx: number | null },
  currencySymbol: string = '₦',
  currencyCode: string = 'NGN'
): ReportData {
  const transactions: Transaction[] = [];

  // Skip row 0 if it contains header texts
  const startRow = 1;

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawDate = row[mapping.dateIdx];
    const rawDesc = row[mapping.descIdx];
    const rawAmt = row[mapping.amtIdx];

    if (rawDate === undefined || rawAmt === undefined) continue;

    // Format fields
    const date = parseExcelDate(rawDate);
    const description = rawDesc !== undefined ? String(rawDesc).trim() : 'Unlabelled Transaction';

    // Parse numeric value
    let amount = 0;
    if (typeof rawAmt === 'number') {
      amount = rawAmt;
    } else if (typeof rawAmt === 'string') {
      amount = parseFloat(rawAmt.replace(/[^\d.-]/g, ''));
    }

    if (isNaN(amount)) continue;

    const type = amount >= 0 ? 'inflow' : 'outflow';

    // Determine category
    let category = '';
    if (mapping.categoryIdx !== null && row[mapping.categoryIdx] !== undefined) {
      category = String(row[mapping.categoryIdx]).trim();
    } else {
      category = guessCategory(description, amount);
    }

    transactions.push({
      date,
      description,
      amount,
      category,
      type
    });
  }

  // Sort transactions by date ascending
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const startDate = transactions.length > 0 ? transactions[0].date : new Date().toISOString().split('T')[0];
  const endDate = transactions.length > 0 ? transactions[transactions.length - 1].date : new Date().toISOString().split('T')[0];

  return {
    title: `Private Report · ${fileName.split('.')[0]}`,
    currency: currencyCode,
    currencySymbol: currencySymbol,
    startDate,
    endDate,
    transactions
  };
}
