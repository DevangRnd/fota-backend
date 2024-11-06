import express from "express";
import * as firmwareController from "../controllers/firmwareController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload-firmware",
  upload.single("firmware"),
  firmwareController.uploadFirmware
);
router.get("/firmwares", firmwareController.getAllFirmwares);
router.get("/download-firmware", firmwareController.downloadFirmware);

export default router;
