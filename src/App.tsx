import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { LandingPage } from './LandingPage';
import { UploadPage } from './UploadPage';
import { Dashboard } from './Dashboard';
import { parseStatementFile, autoParseReport, type ReportData } from './parser';

export default function App() {
  const [viewState, setViewState] = useState<'landing' | 'upload' | 'dashboard'>('landing');
  const [report, setReport] = useState<ReportData | null>(null);

  // Automatically scroll to the top of the page when viewState changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [viewState]);

  // Handle statement file upload with 100% automated parsing
  const handleFileUpload = async (file: File) => {
    try {
      const rows = await parseStatementFile(file);
      if (rows && rows.length > 0) {
        // Run fully automated mapping and verification engine instantly!
        const finalReport = autoParseReport(file.name, rows);
        setReport(finalReport);
        setViewState('dashboard');
      } else {
        alert('Empty statement file loaded. Please try another CSV, Excel, or PDF file.');
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing statement file automatically. Make sure it is a valid CSV, Excel, or PDF document.');
    }
  };

  // Reset tracker state back to landing page
  const handleReset = () => {
    setReport(null);
    setViewState('landing');
  };

  return (
    <Layout onReset={handleReset} showReset={viewState !== 'landing'}>
      {viewState === 'landing' && (
        <LandingPage onGetStarted={() => setViewState('upload')} />
      )}

      {viewState === 'upload' && (
        <UploadPage onFileUpload={handleFileUpload} onBack={handleReset} />
      )}

      {viewState === 'dashboard' && report && (
        <div className="space-y-4">
          <Dashboard report={report} onReset={handleReset} />
        </div>
      )}
    </Layout>
  );
}
