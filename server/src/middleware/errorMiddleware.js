import logger from "../utils/logger.js";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error
  if (err.statusCode === 500) {
    logger.error(`${err.name}: ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`${err.statusCode} - ${err.message} - ${req.originalUrl}`);
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      // Unique constraint violation
      return res.status(400).json({
        status: "fail",
        message: "A record with that data already exists.",
      });
    }
    if (err.code === "P2025") {
      // Record not found
      return res.status(404).json({
        status: "fail",
        message: "Record not found.",
      });
    }
  }

  // Development error
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production error - operational errors are sent to client, programming errors are just generic
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown error
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

// Async error handler to catch async errors
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
