import express from "express";
import * as deviceController from "../controllers/deviceController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add-device", upload.single("file"), deviceController.addDevices);
router.get("/devices", deviceController.getAllDevices);
router.post("/initiate-update", deviceController.initiateUpdate);
router.get("/check-for-update/:deviceId", deviceController.checkForUpdate);
router.post(
  "/update-completed/:deviceId",
  deviceController.markUpdateCompleted
);

export default router;