// src/components/StoryViewer.jsx
import { useState } from "react";

const StoryViewer = ({ segment, onClose }) => {
  if (!segment) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content story-viewer-modal">
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>

        <div className="story-viewer-header">
          <div className="segment-number">
            Chapter {segment.sequenceNumber || "?"}
          </div>
          <div className="segment-location">
            {segment.locationContext || "Unknown location"}
          </div>
        </div>

        <div className="story-viewer-content">
          {segment.content
            .split("\n")
            .map((paragraph, index) =>
              paragraph ? <p key={index}>{paragraph}</p> : null
            )}
        </div>

        {segment.userChoice && (
          <div className="story-viewer-choice">
            <span className="choice-label">Your choice:</span>{" "}
            {segment.userChoice}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
