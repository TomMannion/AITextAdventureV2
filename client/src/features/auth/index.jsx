// src/features/auth/index.js
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import UserProfile from "./components/UserProfile";
import LoginScreen from "./components/LoginScreen";

// Export auth components
export { LoginForm, RegisterForm, UserProfile, LoginScreen };

// Function to register auth window types with the window registry
import {
  registerWindowType,
  placementStrategies,
} from "../window-system/registry/windowRegistry";

/**
 * Register authentication windows with the window registry
 */
const registerAuthWindows = () => {
  // Register the Login window
  registerWindowType("login-window", {
    component: LoginForm,
    defaultProps: {},
    title: "Windows 95 Login",
    width: 400,
    height: 300,
    icon: "👤", // This would be a proper icon path in production
    placement: placementStrategies.CENTER,
    resizable: false,
  });

  // Register the Registration window
  registerWindowType("register-window", {
    component: RegisterForm,
    defaultProps: {},
    title: "Create New User Account",
    width: 450,
    height: 400,
    icon: "👤", // This would be a proper icon path in production
    placement: placementStrategies.CENTER,
    resizable: false,
  });

  // Register the User Profile window
  registerWindowType("user-profile", {
    component: UserProfile,
    defaultProps: {},
    title: "User Profile",
    width: 450,
    height: 400,
    icon: "👤", // This would be a proper icon path in production
    placement: placementStrategies.CENTER,
    resizable: true,
  });

  console.log("Registered auth windows");
  return true;
};

export { registerAuthWindows };
