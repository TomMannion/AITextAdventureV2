// src/components/StoryHistory.jsx
import { useState } from "react";

const StoryHistory = ({ segments, currentSegmentId, onSegmentClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine which segments to show
  const recentSegmentsCount = 3;
  const hasMoreSegments = segments.length > recentSegmentsCount;

  // When collapsed, show only the most recent segments
  const visibleSegments = isExpanded
    ? segments
    : segments.slice(Math.max(0, segments.length - recentSegmentsCount));

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!segments || segments.length === 0) {
    return null;
  }

  return (
    <div className="story-history">
      <div className="story-history-header">
        <h3>Story History</h3>
        {hasMoreSegments && (
          <button className="toggle-history-btn" onClick={toggleExpanded}>
            {isExpanded ? "Show Less" : "Show All"}
          </button>
        )}
      </div>

      <div className="story-history-segments">
        {!isExpanded && hasMoreSegments && (
          <div className="history-ellipsis">
            <span>...</span>
          </div>
        )}

        {visibleSegments.map((segment, index) => (
          <div
            key={segment.id || index}
            className={`history-segment ${
              segment.id === currentSegmentId ? "current" : ""
            }`}
            onClick={() => onSegmentClick && onSegmentClick(segment)}
          >
            <div className="segment-number">
              {segment.sequenceNumber || index + 1}
            </div>
            <div className="segment-content">
              <div className="segment-location">
                {segment.locationContext || "Unknown location"}
              </div>
              <p className="segment-text">
                {segment.content.length > 120
                  ? segment.content.substring(0, 120) + "..."
                  : segment.content}
              </p>
              {segment.userChoice && (
                <div className="segment-choice">
                  <span className="choice-label">Your choice:</span>{" "}
                  {segment.userChoice}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryHistory;
