import './SeverityBadge.css';

function SeverityBadge({ result }) {
  const { severity } = result;

  return (
    <div className="severity-container">
      <div className="severity-badge" style={{ borderColor: severity.color }}>
        <div
          className="severity-indicator"
          style={{ backgroundColor: severity.color }}
        />
        <div className="severity-content">
          <h2 className="severity-level">{severity.level}</h2>
          <p className="severity-value">
            Hemoglobin: <strong>{severity.hbValue} {severity.unit}</strong>
          </p>
        </div>
      </div>

      <div className="message-box">
        <p className="severity-message">{severity.message}</p>
      </div>

      {result.rawData && (
        <div className="additional-data">
          <h4>Additional Values</h4>
          <div className="data-grid">
            {result.rawData.ferritin !== null && (
              <div className="data-item">
                <span className="data-label">Ferritin:</span>
                <span className="data-value">{result.rawData.ferritin} ng/mL</span>
              </div>
            )}
            {result.rawData.mcv !== null && (
              <div className="data-item">
                <span className="data-label">MCV:</span>
                <span className="data-value">{result.rawData.mcv} fL</span>
              </div>
            )}
            {result.rawData.mchc !== null && (
              <div className="data-item">
                <span className="data-label">MCHC:</span>
                <span className="data-value">{result.rawData.mchc} g/dL</span>
              </div>
            )}
          </div>
        </div>
      )}

      {result.manualEntry && (
        <p className="manual-entry-note">
          ℹ️ Entered manually
        </p>
      )}
    </div>
  );
}

export default SeverityBadge;
