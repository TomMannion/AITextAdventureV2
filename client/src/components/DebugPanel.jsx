// src/components/DebugPanel.jsx
import { useState } from "react";

const DebugPanel = ({ data, title = "Debug Info" }) => {
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  return (
    <div className="debug-panel">
      <div className="debug-header" onClick={() => setExpanded(!expanded)}>
        <h3>{title}</h3>
        <span>{expanded ? "▼" : "▶"}</span>
      </div>

      {expanded && (
        <div className="debug-content">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
