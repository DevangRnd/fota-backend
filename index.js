import express from "express"; // Importing the Express framework
import connectToDB from "./lib/connectToDB.js"; // Importing database connection utility
import multer from "multer"; // Importing multer for handling file uploads
import Firmware from "./models/FirmwareModel.js"; // Importing the Firmware model
import Device from "./models/DeviceModel.js"; // Importing the Device model
import { configDotenv } from "dotenv"; // Importing dotenv for environment variables
import cors from "cors";
import xlsx from "xlsx";
// Initialize Express app
const app = express();
app.use(cors());
// Configure multer for file uploads to memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Load environment variables from .env file
configDotenv();

// Connect to the database
connectToDB();

// Middleware to parse JSON request body
app.use(express.json());

// Endpoint for devices to upload firmware
app.post("/api/add-device", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  let rows;
  const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    // If the file is CSV, read it differently
    if (fileExtension === "csv") {
      rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        raw: true,
      });
    } else {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = xlsx.utils.sheet_to_json(sheet);
    }
  } catch (error) {
    return res.status(400).json({
      error:
        "Failed to parse the file. Please upload a valid Excel or CSV file.",
    });
  }

  const errors = [];
  const addedDevices = [];

  for (const row of rows) {
    const { DeviceId, Vendor, District, Block, Panchayat } = row;

    if (!DeviceId || !Vendor || !District || !Block || !Panchayat) {
      errors.push(
        `Missing required fields for device ${DeviceId || "unknown"}`,
      );
      continue;
    }

    const existingDevice = await Device.findOne({ deviceId: DeviceId });
    if (existingDevice) {
      errors.push(`Device ${DeviceId} already exists`);
      continue;
    }

    const newDevice = new Device({
      deviceId: DeviceId,
      vendor: Vendor,
      district: District,
      block: Block,
      panchayat: Panchayat,
    });

    try {
      await newDevice.save();
      addedDevices.push(DeviceId);
    } catch (error) {
      errors.push(`Failed to add device ${DeviceId}: ${error.message}`);
    }
  }

  // Always return both arrays, regardless of success or failure
  res.status(errors.length > 0 ? 207 : 201).json({
    addedDevices,
    errors,
    message:
      errors.length > 0
        ? addedDevices.length > 0
          ? "Partial success"
          : "Failed to add devices"
        : "All devices added successfully",
  });
});

// Endpoint to get all added devices
app.get("/api/devices", async (req, res) => {
  try {
    const allDevices = await Device.find({}); // Retrieve all devices from the database
    res.json({ allDevices }); // Send the devices as a response
  } catch (error) {
    console.error("Error retrieving devices:", error);
    res.status(500).json({ error: "Failed to retrieve devices" });
  }
});

// Endpoint to initiate update for selected devices
app.post("/api/initiate-update", async (req, res) => {
  const { deviceIds, firmwareName } = req.body;

  // Validate request payload
  if (!deviceIds || !firmwareName) {
    return res
      .status(400)
      .json({ error: "Device IDs and firmware name are required" });
  }

  // Find the firmware by name
  const firmware = await Firmware.findOne({ name: firmwareName });
  if (!firmware) {
    return res.status(404).json({ error: "Firmware not found" });
  }

  // Mark devices for update with the specified firmware
  await Device.updateMany(
    { deviceId: { $in: deviceIds } },
    { $set: { pendingUpdate: true, targetFirmwareName: firmwareName } },
  );

  // Send success response
  res.json({ message: "Update initiated for selected devices" });
});

//GIven to IOT for checking update
app.get("/api/check-for-update/:deviceId", async (req, res) => {
  const { deviceId } = req.params;

  const device = await Device.findOne({ deviceId });
  if (!device) {
    return res.status(404).json({ error: "Device not found" });
  }

  // If the device has a pending update, get the firmware file
  if (device.pendingUpdate) {
    const firmware = await Firmware.findOne({
      name: device.targetFirmwareName,
    });

    if (!firmware) {
      return res.status(404).json({ error: "Firmware file not found" });
    }

    // Send the firmware file
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${firmware.name}`,
    );
    res.setHeader("Content-Type", "application/octet-stream");
    return res.send(firmware.file);
  } else {
    res.json({ updateAvailable: false });
  }
});
// Endpoint to fetch all firmware records
app.get("/api/firmwares", async (req, res) => {
  try {
    const allFirmwares = await Firmware.find({}, "name _id"); // Fetch only necessary fields
    res.json({ allFirmwares });
  } catch (error) {
    console.error("Error retrieving firmwares:", error);
    res.status(500).json({ error: "Failed to retrieve firmware list" });
  }
});

// Start the server on port 7070
app.listen(7070, () => {
  console.log(`App is running on port 7070`);
});
