import express from "express";
import {
  checkAuth,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";
import { verifyToken } from "../lib/verifyToken.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", verifyToken, checkAuth);
export default router;
