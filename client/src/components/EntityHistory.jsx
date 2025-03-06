import React, { useState } from "react";

const EntityHistory = ({ gameId, entityId, entityType, history, onClose }) => {
  const [activeTab, setActiveTab] = useState("timeline");

  if (!history || !history.entity) {
    return (
      <div className="modal-overlay">
        <div className="modal-content entity-history-modal">
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
          <div className="warning-message">
            No history found for this entity.
          </div>
        </div>
      </div>
    );
  }

  const { entity, mentions, stateHistory, relatedEntities } = history;

  // Get state badge styling
  const getStateBadgeClass = (state) => {
    if (!state) return "neutral";

    const stateMap = {
      DEFAULT: "neutral",
      BROKEN: "hostile",
      CONSUMED: "hostile",
      USED: "neutral",
      GIVEN_AWAY: "hostile",
      LOST: "hostile",
      FOUND: "friendly",
      MODIFIED: "neutral",
      FRIENDLY: "friendly",
      NEUTRAL: "neutral",
      HOSTILE: "hostile",
      IDENTITY_REVEALED: "friendly",
    };

    return stateMap[state] || "neutral";
  };

  // Format state label
  const formatStateLabel = (state) => {
    if (!state) return "Normal";

    // Replace underscores with spaces and capitalize each word
    return state
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Timeline tab content
  const renderTimelineTab = () => (
    <div className="entity-history-timeline">
      {mentions && mentions.length > 0 ? (
        mentions.map((mention, index) => (
          <div key={index} className="history-segment">
            <div className="history-segment-header">
              <div className="segment-number">{mention.segmentNumber}</div>
              <div className="segment-location">
                {mention.location || "Unknown"}
              </div>
              {mention.stateChange && (
                <span
                  className={`relationship-badge ${getStateBadgeClass(
                    mention.newState
                  )}`}
                >
                  {formatStateLabel(mention.newState)}
                </span>
              )}
            </div>
            {mention.context && (
              <div className="segment-content">
                <p className="segment-text">{mention.context}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="no-history">
          <p>No detailed appearance history available.</p>
        </div>
      )}
    </div>
  );

  // Details tab content
  const renderDetailsTab = () => (
    <div className="entity-details">
      <div className="entity-section">
        <h3>Basic Information</h3>
        <div className="entity-info-grid">
          <div className="entity-info-label">Name:</div>
          <div className="entity-info-value">{entity.name}</div>

          {entityType === "item" && (
            <>
              <div className="entity-info-label">Current State:</div>
              <div className="entity-info-value">
                <span
                  className={`relationship-badge ${getStateBadgeClass(
                    entity.currentState
                  )}`}
                >
                  {formatStateLabel(entity.currentState || "DEFAULT")}
                </span>
              </div>

              <div className="entity-info-label">Acquired:</div>
              <div className="entity-info-value">Turn {entity.acquiredAt}</div>

              {entity.lostAt && (
                <>
                  <div className="entity-info-label">Lost/Used:</div>
                  <div className="entity-info-value">Turn {entity.lostAt}</div>
                </>
              )}
            </>
          )}

          {entityType === "character" && (
            <>
              <div className="entity-info-label">Relationship:</div>
              <div className="entity-info-value">
                <span
                  className={`relationship-badge ${getStateBadgeClass(
                    entity.relationship
                  )}`}
                >
                  {entity.relationship}
                </span>
              </div>

              <div className="entity-info-label">First Appearance:</div>
              <div className="entity-info-value">
                Turn {entity.firstAppearedAt}
              </div>

              <div className="entity-info-label">Last Appearance:</div>
              <div className="entity-info-value">
                Turn {entity.lastAppearedAt || "?"}
              </div>

              {entity.aliases && entity.aliases.length > 0 && (
                <>
                  <div className="entity-info-label">Known As:</div>
                  <div className="entity-info-value entity-aliases">
                    {entity.aliases.map((alias, i) => (
                      <span key={i} className="entity-alias">
                        {alias}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {entity.description && (
        <div className="entity-section">
          <h3>Description</h3>
          <div className="entity-description">{entity.description}</div>
        </div>
      )}

      {entityType === "character" && relatedEntities && (
        <div className="entity-section">
          <h3>Character Identities</h3>

          {relatedEntities.revealedIdentity && (
            <div className="entity-identity-section">
              <h4>True Identity:</h4>
              <div className="entity-identity">
                <span className="relationship-badge friendly">
                  {relatedEntities.revealedIdentity.name}
                </span>
              </div>
            </div>
          )}

          {relatedEntities.originalIdentities &&
            relatedEntities.originalIdentities.length > 0 && (
              <div className="entity-identity-section">
                <h4>Alternative Identities:</h4>
                <div className="entity-identities">
                  {relatedEntities.originalIdentities.map((identity, index) => (
                    <span key={index} className="relationship-badge friendly">
                      {identity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {!relatedEntities.revealedIdentity &&
            (!relatedEntities.originalIdentities ||
              relatedEntities.originalIdentities.length === 0) && (
              <p className="no-identities">No identity connections found.</p>
            )}
        </div>
      )}

      {stateHistory && stateHistory.length > 0 && (
        <div className="entity-section">
          <h3>State History</h3>
          <div className="state-history-list">
            {stateHistory.map((state, index) => (
              <div key={index} className="state-history-item">
                <div className="state-history-header">
                  <span className="state-turn">Turn {state.turn}:</span>
                  <span
                    className={`relationship-badge ${getStateBadgeClass(
                      state.state || state.type
                    )}`}
                  >
                    {formatStateLabel(state.state || state.type)}
                  </span>
                </div>
                {state.context && (
                  <div className="state-context">"{state.context}"</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content entity-history-modal">
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>

        <div className="entity-history-header">
          <h2>{entity.name}</h2>
          <div className="entity-type">
            {entityType === "item" ? "Item History" : "Character History"}
          </div>
        </div>

        <div className="entity-history-tabs">
          <div className="tabs-header">
            <button
              className={`tab-button ${
                activeTab === "timeline" ? "active" : ""
              }`}
              onClick={() => setActiveTab("timeline")}
            >
              Timeline
            </button>
            <button
              className={`tab-button ${
                activeTab === "details" ? "active" : ""
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "timeline" && renderTimelineTab()}
            {activeTab === "details" && renderDetailsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityHistory;
