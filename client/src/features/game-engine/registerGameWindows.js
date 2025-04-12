import {
  registerWindowType,
  placementStrategies,
} from '../window-system/registry/windowRegistry';
import GameModule from './GameModule';
import { placeholderIcons } from '../../utils/iconUtils';

/**
 * Register game windows with the window registry
 * This function is called when the feature is loaded
 */
const registerGameWindows = () => {
  registerWindowType('text-adventure', {
    component: GameModule,
    defaultProps: {},
    title: 'Windows 95 Text Adventure',
    width: 800,
    height: 600,
    icon: placeholderIcons.adventure,
    placement: placementStrategies.CENTER,
    resizable: true,
  });
  
  console.log('Registered game windows');
  return true;
};

export default registerGameWindows;