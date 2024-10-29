import express from "express"; // Importing the Express framework
import connectToDB from "./lib/connectToDB.js"; // Importing database connection utility
import multer from "multer"; // Importing multer for handling file uploads
import Firmware from "./models/FirmwareModel.js"; // Importing the Firmware model
import Device from "./models/DeviceModel.js"; // Importing the Device model
import { configDotenv } from "dotenv"; // Importing dotenv for environment variables
import cors from "cors";
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
app.post(
  "/api/upload-firmware",
  upload.single("firmware"),
  async (req, res) => {
    const { name } = req.body;

    // Validate request payload
    if (!req.file || !name) {
      return res
        .status(400)
        .json({ error: "Firmware file and name are required" });
    }

    try {
      // Create a new firmware document in MongoDB
      const newFirmware = new Firmware({
        name,
        file: req.file.buffer, // Store the binary file data
      });

      // Save firmware to database
      await newFirmware.save();

      // Respond with success message and firmware ID
      res.json({
        message: "Firmware uploaded successfully",
        firmwareId: newFirmware._id,
        name,
      });
    } catch (error) {
      console.error("Error saving firmware:", error);
      res.status(500).json({ error: "Failed to upload firmware" });
    }
  }
);

// Endpoint to add one or multiple devices
app.post("/api/add-device", async (req, res) => {
  const { deviceId } = req.body;

  // Ensure the deviceId field is provided
  if (!deviceId) {
    return res.status(400).json({ error: "Device ID(s) are required" });
  }

  // Normalize input to always be an array
  const deviceIds = Array.isArray(deviceId) ? deviceId : [deviceId];

  // Prepare an array to store any errors
  const errors = [];

  // Iterate through device IDs to add them
  for (const id of deviceIds) {
    // Check if the device already exists
    const existingDevice = await Device.findOne({ deviceId: id });
    if (existingDevice) {
      errors.push(`Device ${id} already exists`);
      continue; // Skip to the next ID
    }

    // Create a new device document
    const newDevice = new Device({ deviceId: id });
    try {
      await newDevice.save(); // Save the device to the database
    } catch (error) {
      errors.push(`Failed to add device ${id}: ${error.message}`);
    }
  }

  // Construct a response based on success or errors
  const responseMessage =
    errors.length > 0
      ? { message: "Some devices could not be added", errors }
      : { message: "Devices added successfully", addedDevices: deviceIds };

  // Send response with appropriate status code
  res.status(errors.length > 0 ? 207 : 201).json(responseMessage);
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
    { $set: { pendingUpdate: true, targetFirmwareName: firmwareName } }
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
      `attachment; filename=${firmware.name}`
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
