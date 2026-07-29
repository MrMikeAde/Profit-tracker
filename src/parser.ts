import * as XLSX from 'xlsx';

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

export interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'inflow' | 'outflow';
}

// Convert common Excel serial date format to YYYY-MM-DD
function parseExcelDate(serial: any): string {
  if (serial instanceof Date) {
    const yyyy = serial.getFullYear();
    const mm = String(serial.getMonth() + 1).padStart(2, '0');
    const dd = String(serial.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
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

// Dynamic PDF.js loader and script injection
function loadPdfJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js engine from CDN.'));
    document.head.appendChild(script);
  });
}

// PDF Text Extraction & Tabular Row Reconstructor
async function parsePdfFile(file: File): Promise<any[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await loadPdfJs();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const rows: any[][] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // Cluster items by their vertical position (y coordinate) to reconstruct table rows
    const linesMap: { [y: number]: any[] } = {};
    items.forEach((item) => {
      const y = item.transform[5];
      // Search for an existing y-coordinate within a 5-point vertical line threshold
      const foundKey = Object.keys(linesMap)
        .map(Number)
        .find((k) => Math.abs(k - y) < 5);

      if (foundKey !== undefined) {
        linesMap[foundKey].push(item);
      } else {
        linesMap[y] = [item];
      }
    });

    // Sort rows from top (highest y coordinate) to bottom
    const sortedY = Object.keys(linesMap)
      .map(Number)
      .sort((a, b) => b - a);

    sortedY.forEach((y) => {
      // Sort columns horizontally from left to right (x coordinate is transform[4])
      const lineItems = linesMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
      const lineTextParts = lineItems.map((item) => item.str.trim()).filter((str) => str.length > 0);

      if (lineTextParts.length > 0) {
        rows.push(lineTextParts);
      }
    });
  }

  return rows;
}

export function parseStatementFile(file: File): Promise<any[]> {
  if (file.name.toLowerCase().endsWith('.pdf')) {
    return parsePdfFile(file);
  }

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

// 100% AUTOMATIC STATEMENT COMPILER ENGINE (No manual mapping UI required)
export function autoParseReport(fileName: string, rawRows: any[][]): ReportData {
  let headerIdx = -1;
  let dateIdx = -1;
  let descIdx = -1;
  let amtIdx = -1;
  let debitIdx = -1;
  let creditIdx = -1;

  // Scan the first 25 rows to identify the actual bank statement table header row
  for (let r = 0; r < Math.min(25, rawRows.length); r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    let hasDate = false;
    let hasDesc = false;
    let hasAmt = false;
    let hasDebit = false;
    let hasCredit = false;

    row.forEach((cell) => {
      const val = String(cell || '').toLowerCase().trim();
      if (val.includes('date') || val.includes('time') || val.includes('timestamp')) {
        hasDate = true;
      }
      if (val.includes('desc') || val.includes('narrat') || val.includes('particular') || val.includes('payee') || val.includes('remark') || val.includes('detail')) {
        hasDesc = true;
      }
      if (val.includes('amount') || val.includes('value') || val.includes('sum') || val.includes('amt')) {
        hasAmt = true;
      }
      if (val.includes('debit') || val.includes('withdraw') || val.includes('outflow') || val.includes('paid out')) {
        hasDebit = true;
      }
      if (val.includes('credit') || val.includes('deposit') || val.includes('inflow') || val.includes('paid in')) {
        hasCredit = true;
      }
    });

    // We found our header row if it contains Date and at least one other major indicator
    if (hasDate && (hasDesc || hasAmt || (hasDebit && hasCredit))) {
      headerIdx = r;
      row.forEach((cell, cIdx) => {
        const val = String(cell || '').toLowerCase().trim();
        if (val.includes('date') || val.includes('time') || val.includes('timestamp')) {
          if (dateIdx === -1) dateIdx = cIdx;
        } else if (val.includes('desc') || val.includes('narrat') || val.includes('particular') || val.includes('payee') || val.includes('remark') || val.includes('detail')) {
          if (descIdx === -1) descIdx = cIdx;
        } else if (val.includes('amount') || val.includes('value') || val.includes('sum') || val.includes('amt')) {
          if (amtIdx === -1) amtIdx = cIdx;
        } else if (val.includes('debit') || val.includes('withdraw') || val.includes('outflow') || val.includes('paid out')) {
          if (debitIdx === -1) debitIdx = cIdx;
        } else if (val.includes('credit') || val.includes('deposit') || val.includes('inflow') || val.includes('paid in')) {
          if (creditIdx === -1) creditIdx = cIdx;
        }
      });
      break;
    }
  }

  // Fallbacks if no header row was confidently matched
  if (headerIdx === -1) {
    headerIdx = 0;
    dateIdx = 0;
    descIdx = 1;
    amtIdx = 2;
  }

  const transactions: Transaction[] = [];
  const startRow = headerIdx + 1;

  for (let i = startRow; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const rawDate = row[dateIdx];
    const rawDesc = row[descIdx];

    if (rawDate === undefined) continue;

    const date = parseExcelDate(rawDate);
    const description = rawDesc !== undefined ? String(rawDesc).trim() : 'Transaction Detail';

    // Parse single amount column or reconcile credit/debit combinations
    let amount = 0;
    if (amtIdx !== -1 && row[amtIdx] !== undefined) {
      const rawAmt = row[amtIdx];
      if (typeof rawAmt === 'number') {
        amount = rawAmt;
      } else if (typeof rawAmt === 'string') {
        amount = parseFloat(rawAmt.replace(/[^\d.-]/g, ''));
      }
    } else {
      // Reconcile multi-column credit/debit structure
      let debit = 0;
      let credit = 0;
      if (debitIdx !== -1 && row[debitIdx] !== undefined) {
        const rawDebit = row[debitIdx];
        if (typeof rawDebit === 'number') debit = rawDebit;
        else if (typeof rawDebit === 'string') debit = parseFloat(rawDebit.replace(/[^\d.-]/g, '')) || 0;
      }
      if (creditIdx !== -1 && row[creditIdx] !== undefined) {
        const rawCredit = row[creditIdx];
        if (typeof rawCredit === 'number') credit = rawCredit;
        else if (typeof rawCredit === 'string') credit = parseFloat(rawCredit.replace(/[^\d.-]/g, '')) || 0;
      }

      if (credit > 0) {
        amount = credit;
      } else if (debit > 0) {
        amount = -Math.abs(debit);
      }
    }

    if (isNaN(amount) || amount === 0) continue;

    const type = amount >= 0 ? 'inflow' : 'outflow';
    const category = guessCategory(description, amount);

    transactions.push({
      date,
      description,
      amount,
      category,
      type
    });
  }

  // Sort transactions chronologically
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const startDate = transactions.length > 0 ? transactions[0].date : new Date().toISOString().split('T')[0];
  const endDate = transactions.length > 0 ? transactions[transactions.length - 1].date : new Date().toISOString().split('T')[0];

  // Dynamically guess currency attributes based on typical file indicators or keywords
  let currencySymbol = '₦';
  let currencyCode = 'NGN';
  const fileLower = fileName.toLowerCase();
  if (fileLower.includes('usd') || fileLower.includes('dollar') || fileLower.includes('usa')) {
    currencySymbol = '$';
    currencyCode = 'USD';
  } else if (fileLower.includes('eur') || fileLower.includes('euro') || fileLower.includes('europe')) {
    currencySymbol = '€';
    currencyCode = 'EUR';
  } else if (fileLower.includes('gbp') || fileLower.includes('pound') || fileLower.includes('uk')) {
    currencySymbol = '£';
    currencyCode = 'GBP';
  }

  return {
    title: `Private Report · ${fileName.split('.')[0]}`,
    currency: currencyCode,
    currencySymbol,
    startDate,
    endDate,
    transactions
  };
}
