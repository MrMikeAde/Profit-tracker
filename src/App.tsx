import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { LandingPage } from './LandingPage';
import { ColumnMapper } from './ColumnMapper';
import { Dashboard } from './Dashboard';
import { parseStatementFile, type ReportData } from './parser';

export default function App() {
  const [viewState, setViewState] = useState<'landing' | 'mapper' | 'dashboard'>('landing');
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [report, setReport] = useState<ReportData | null>(null);

  // Automatically scroll to the top of the page when viewState changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [viewState]);

  // Handle spreadsheet or PDF file upload
  const handleFileUpload = async (file: File) => {
    try {
      setFileName(file.name);
      const rows = await parseStatementFile(file);
      if (rows && rows.length > 0) {
        setRawRows(rows);
        setViewState('mapper');
      } else {
        alert('Empty statement file loaded. Please try another CSV, Excel, or PDF file.');
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing statement file. Make sure it is a valid CSV, Excel, or PDF document.');
    }
  };

  // Callback when column configuration is completed
  const handleMappingComplete = (finalReport: ReportData) => {
    setReport(finalReport);
    setViewState('dashboard');
  };

  // Reset tracker state back to landing page
  const handleReset = () => {
    setReport(null);
    setRawRows([]);
    setFileName('');
    setViewState('landing');
  };

  return (
    <Layout onReset={handleReset} showReset={viewState !== 'landing'}>
      {viewState === 'landing' && (
        <LandingPage onFileUpload={handleFileUpload} />
      )}

      {viewState === 'mapper' && (
        <ColumnMapper
          fileName={fileName}
          rawRows={rawRows}
          onMappingComplete={handleMappingComplete}
          onCancel={handleReset}
        />
      )}

      {viewState === 'dashboard' && report && (
        <div className="space-y-4">
          <Dashboard report={report} onReset={handleReset} />
        </div>
      )}
    </Layout>
  );
}
