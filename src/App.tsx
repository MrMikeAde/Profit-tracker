import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import { LandingPage } from './LandingPage';
import { UploadPage } from './UploadPage';
import { Dashboard } from './Dashboard';
import { parseStatementFile, autoParseReport, type ReportData } from './parser';

function AppContent() {
  const [report, setReport] = useState<ReportData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top automatically upon route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [location.pathname]);

  // Handle statement file upload with 100% automated parsing
  const handleFileUpload = async (file: File) => {
    try {
      const rows = await parseStatementFile(file);
      if (rows && rows.length > 0) {
        // Run fully automated mapping and verification engine instantly!
        const finalReport = autoParseReport(file.name, rows);
        setReport(finalReport);
        navigate('/report'); // Navigate directly to /report page
      } else {
        alert('Empty statement file loaded. Please try another CSV, Excel, or PDF file.');
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing statement file automatically. Make sure it is a valid CSV, Excel, or PDF document.');
    }
  };

  // Click 'New Statement' triggers reset and routes back to '/upload' instead of homepage
  const handleReset = () => {
    setReport(null);
    navigate('/upload');
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage onFileUpload={handleFileUpload} />} />
        <Route
          path="/report"
          element={
            report ? (
              <div className="space-y-4">
                <Dashboard report={report} onReset={handleReset} />
              </div>
            ) : (
              <Navigate to="/upload" replace />
            )
          }
        />
        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
