import { useState } from 'react';
import UploadScan from './components/UploadScan';
import SeverityBadge from './components/SeverityBadge';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScanComplete = (scanResult) => {
    setResult(scanResult);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🩸 RaktVa.ai</h1>
        <p className="tagline">Anemia Screening & Nutrition Guidance</p>
      </header>

      <main className="app-main">
        {!result && !error && (
          <UploadScan
            onScanComplete={handleScanComplete}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {error && (
          <div className="error-container">
            <div className="error-box">
              <h3>⚠️ Manual Entry Required</h3>
              <p>{error}</p>
              <button onClick={handleReset} className="btn-secondary">
                Try Again
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="results-container">
            <SeverityBadge result={result} />
            <button onClick={handleReset} className="btn-secondary">
              New Scan
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Part of Anemia Mukt Bharat (AMB) initiative</p>
        <p className="disclaimer">For screening purposes only. Consult a doctor for diagnosis.</p>
      </footer>
    </div>
  );
}

export default App;
