// Compatibility layer for GameFlowContext.jsx
// This file ensures backward compatibility with components still importing from this path

import { useGameStore, FLOW_STATES } from '../../../contexts/GameStoreContext';

// Re-export the FLOW_STATES
export { FLOW_STATES };

// Create a compatibility hook that redirects to useGameStore
export const useGameFlow = () => {
  return useGameStore();
};

// Create empty provider for compatibility
export const GameFlowProvider = ({ children }) => {
  return children;
};

export default {
  Provider: GameFlowProvider
};