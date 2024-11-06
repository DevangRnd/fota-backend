import Device from "../models/DeviceModel.js";
import xlsx from "xlsx";

export const addDevices = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  let rows;
  const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
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
        `Missing required fields for device ${DeviceId || "unknown"}`
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
};

export const getAllDevices = async (req, res) => {
  try {
    const allDevices = await Device.find({});
    res.json({ allDevices });
  } catch (error) {
    console.error("Error retrieving devices:", error);
    res.status(500).json({ error: "Failed to retrieve devices" });
  }
};

export const initiateUpdate = async (req, res) => {
  const { deviceIds, firmwareName } = req.body;

  if (!deviceIds || !firmwareName) {
    return res
      .status(400)
      .json({ error: "Device IDs and firmware name are required" });
  }

  const firmware = await Firmware.findOne({ name: firmwareName });
  if (!firmware) {
    return res.status(404).json({ error: "Firmware not found" });
  }

  await Device.updateMany(
    { deviceId: { $in: deviceIds } },
    { $set: { pendingUpdate: true, targetFirmwareName: firmwareName } }
  );

  res.json({ message: "Update initiated for selected devices" });
};

export const checkForUpdate = async (req, res) => {
  const { deviceId } = req.params;
  const device = await Device.findOne({ deviceId });
  if (!device) return res.status(404).json({ error: "Device not found" });

  res.json({ updateAvailable: device.pendingUpdate || false });
};

export const markUpdateCompleted = async (req, res) => {
  const { deviceId } = req.params;
  const device = await Device.findOne({ deviceId });

  if (!device) return res.status(404).json({ error: "Device not found" });

  device.currentFirmware = device.targetFirmwareName;
  device.pendingUpdate = false;
  device.targetFirmwareName = null;
  await device.save();

  res.json({ message: "Update completed successfully" });
};
