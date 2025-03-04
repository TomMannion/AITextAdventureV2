// src/routes/contextConfigRoutes.js
import express from "express";
import {
  getContextConfig,
  updateContextConfig,
} from "../controllers/contextConfigController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// All context config routes require authentication
router.use(authenticate);

router.get("/", getContextConfig);
router.put("/", updateContextConfig);

export default router;
