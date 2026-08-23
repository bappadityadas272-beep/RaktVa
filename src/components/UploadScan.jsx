import { useState } from 'react';
import { getSeverity } from '../../core/ruleEngine.js';
import adultConfig from '../../config/adultThresholds.json';
import './UploadScan.css';

function UploadScan({ onScanComplete, onError, loading, setLoading }) {
  const [preview, setPreview] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [hbValue, setHbValue] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Process with Gemini API
    setLoading(true);

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch('/api/parse-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64 })
      });

      const result = await response.json();

      if (result.fallbackToManual) {
        setManualEntry(true);
        setLoading(false);
        onError(result.error || 'Could not read report clearly. Please enter values manually.');
        return;
      }

      if (result.success && result.data) {
        // Process with rule engine
        const severity = getSeverity(result.data.hb, adultConfig);

        onScanComplete({
          severity,
          rawData: result.data,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
      } else {
        throw new Error('Unexpected response format');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setManualEntry(true);
      setLoading(false);
      onError('Failed to process image. Please try again or enter manually.');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();

    const hb = parseFloat(hbValue);

    if (isNaN(hb) || hb < 0 || hb > 25) {
      onError('Please enter a valid hemoglobin value (0-25 g/dL)');
      return;
    }

    try {
      const severity = getSeverity(hb, adultConfig);

      onScanComplete({
        severity,
        rawData: { hb, ferritin: null, mcv: null, mchc: null },
        timestamp: new Date().toISOString(),
        manualEntry: true
      });
    } catch (error) {
      onError('Error processing hemoglobin value');
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  if (manualEntry) {
    return (
      <div className="upload-container">
        <div className="manual-entry-box">
          <h3>📝 Manual Entry</h3>
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label htmlFor="hb">Hemoglobin (g/dL)</label>
              <input
                type="number"
                id="hb"
                step="0.1"
                min="0"
                max="25"
                value={hbValue}
                onChange={(e) => setHbValue(e.target.value)}
                placeholder="e.g., 12.5"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary">
              Check Status
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-box">
        <div className="upload-icon">📸</div>
        <h2>Upload CBC Lab Report</h2>
        <p>Take a clear photo of your blood test report</p>

        <label className="upload-btn">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            disabled={loading}
          />
          {loading ? 'Processing...' : 'Choose Photo'}
        </label>

        {preview && (
          <div className="preview">
            <img src={preview} alt="Report preview" />
          </div>
        )}

        <button
          onClick={() => setManualEntry(true)}
          className="btn-link"
          disabled={loading}
        >
          Enter values manually
        </button>
      </div>
    </div>
  );
}

export default UploadScan;
