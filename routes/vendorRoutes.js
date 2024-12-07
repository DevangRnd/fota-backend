import express from "express";
import {
  createVendor,
  getVendorsForAProject,
} from "../controllers/vendorControllers.js";
const router = express.Router();
// Create Vendor for a specific project
router.post("/project/:projectId/create-vendor", createVendor);

// Get vendors for a specific project
router.get("/project/:projectId/all-vendors", getVendorsForAProject);

export default router;
