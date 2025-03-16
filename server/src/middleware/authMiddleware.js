import jwt from "jsonwebtoken";
import { promisify } from "util";
import prisma from "../models/index.js";
import config from "../config/index.js";
import { ApiError } from "./errorMiddleware.js";

/**
 * Protect routes - Authentication middleware
 * Verifies JWT token and adds user to request object
 */
export const protect = async (req, res, next) => {
  // 1) Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(401, "You are not logged in. Please log in to get access.")
    );
  }

  try {
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, config.auth.jwtSecret);

    // 3) Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return next(
        new ApiError(401, "The user belonging to this token no longer exists.")
      );
    }

    // 4) Add user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token. Please log in again."));
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError(401, "Your token has expired. Please log in again.")
      );
    }
    next(error);
  }
};

/**
 * Restrict access to certain roles
 * @param {...String} roles - Allowed roles
 * @returns {Function} Middleware function
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action")
      );
    }

    next();
  };
};
