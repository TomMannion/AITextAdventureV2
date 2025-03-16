import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../models/index.js";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import { ApiError } from "../middleware/errorMiddleware.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });
};

/**
 * Register a new user
 * @route POST /api/users/register
 * @access Public
 */
export const registerUser = async (req, res) => {
  const { username, email, password, preferredProvider, preferredModel } =
    req.body;

  // Validate required fields
  if (!username || !email || !password) {
    throw new ApiError(400, "Please provide username, email and password");
  }

  // Check if user already exists
  const userExists = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (userExists) {
    throw new ApiError(400, "User with that email or username already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      preferredProvider,
      preferredModel,
      contextConfig: {
        create: {
          maxSegments: 16, // Default value
        },
      },
    },
    include: {
      contextConfig: true,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  // Return user data (excluding password)
  res.status(201).json({
    status: "success",
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      preferredProvider: user.preferredProvider,
      preferredModel: user.preferredModel,
      contextConfig: user.contextConfig,
      token,
    },
  });
};

/**
 * Login user
 * @route POST /api/users/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      contextConfig: true,
    },
  });

  // Check if user exists and password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate token
  const token = generateToken(user.id);

  // Return user data
  res.status(200).json({
    status: "success",
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      preferredProvider: user.preferredProvider,
      preferredModel: user.preferredModel,
      contextConfig: user.contextConfig,
      token,
    },
  });
};

/**
 * Get current user profile
 * @route GET /api/users/me
 * @access Private
 */
export const getCurrentUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      contextConfig: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    status: "success",
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      preferredProvider: user.preferredProvider,
      preferredModel: user.preferredModel,
      contextConfig: user.contextConfig,
    },
  });
};

/**
 * Update current user profile
 * @route PUT /api/users/me
 * @access Private
 */
export const updateCurrentUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Build update data object
  const updateData = {};

  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  // Update user
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    include: {
      contextConfig: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      preferredProvider: user.preferredProvider,
      preferredModel: user.preferredModel,
      contextConfig: user.contextConfig,
    },
  });
};

/**
 * Update user preferences
 * @route PUT /api/users/preferences
 * @access Private
 */
export const updateUserPreferences = async (req, res) => {
  const { preferredProvider, preferredModel, maxSegments } = req.body;

  // Build update data object
  const updateData = {};

  if (preferredProvider) updateData.preferredProvider = preferredProvider;
  if (preferredModel) updateData.preferredModel = preferredModel;

  // Update user
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
  });

  // Update context config if maxSegments provided
  let contextConfig = await prisma.contextConfig.findUnique({
    where: { userId: req.user.id },
  });

  if (maxSegments && contextConfig) {
    contextConfig = await prisma.contextConfig.update({
      where: { userId: req.user.id },
      data: { maxSegments },
    });
  } else if (maxSegments && !contextConfig) {
    contextConfig = await prisma.contextConfig.create({
      data: {
        userId: req.user.id,
        maxSegments,
      },
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      preferredProvider: user.preferredProvider,
      preferredModel: user.preferredModel,
      contextConfig,
    },
  });
};

/**
 * Logout user
 * @route POST /api/users/logout
 * @access Private
 */
export const logoutUser = async (req, res) => {
  // In a stateless JWT setup, there's not much to do server-side
  // Client should discard the token

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

/**
 * Delete current user
 * @route DELETE /api/users/me
 * @access Private
 */
export const deleteCurrentUser = async (req, res) => {
  await prisma.user.delete({
    where: { id: req.user.id },
  });

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
};
