import Device from "../models/DeviceModel.js";
import xlsx from "xlsx";
import Firmware from "../models/FirmwareModel.js";
import Vendor from "../models/VendorModel.js";
export const addDevicesForAVendor = async (req, res) => {
  const { vendorId } = req.params;
  const vendorExists = await Vendor.findById(vendorId);

  if (!vendorExists) {
    return res.status(404).json({ error: "Vendor Not Found" });
  }

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
  const newDeviceIds = [];

  for (const row of rows) {
    const { DeviceId, District, Block, Panchayat } = row;

    if (!DeviceId || !District || !Block || !Panchayat) {
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
      vendor: vendorId,
      district: District,
      block: Block,
      panchayat: Panchayat,
    });

    try {
      const savedDevice = await newDevice.save();
      addedDevices.push(DeviceId);
      newDeviceIds.push(savedDevice._id);
    } catch (error) {
      errors.push(`Failed to add device ${DeviceId}: ${error.message}`);
    }
  }

  // Update the Vendor's devices array in bulk
  if (newDeviceIds.length > 0) {
    try {
      await Vendor.findByIdAndUpdate(vendorId, {
        $push: { devices: { $each: newDeviceIds } },
      });
    } catch (error) {
      errors.push(
        "Failed to update vendor's device list. However, devices were added."
      );
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
export const getDevicesByVendor = async (req, res) => {
  const { vendorId } = req.params;
  try {
    // Find the vendor and populate the devices
    const vendor = await Vendor.findById(vendorId).populate("devices");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Check if devices exist for this vendor
    if (!vendor.devices || vendor.devices.length === 0) {
      return res
        .status(200)
        .json({ message: "No devices found for this vendor" });
    }

    return res.status(200).json({ devices: vendor.devices });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve devices" });
    console.error(error);
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
    { $set: { pendingUpdate: true, firmwareName } }
  );

  res.json({ message: "Update initiated for selected devices" });
};

export const checkForUpdate = async (req, res) => {
  const { deviceId } = req.params;
  const { signalStrength } = req.query;
  const device = await Device.findOne({ deviceId });
  if (!device) return res.status(404).json({ error: "Device not found" });
  device.lastUpdated = new Date();
  if (signalStrength) {
    device.signalStrength = parseInt(signalStrength, 10);
  }
  await device.save();

  res.json({ updateAvailable: device.pendingUpdate || false });
};

export const markUpdateCompleted = async (req, res) => {
  const { deviceId } = req.params;
  const device = await Device.findOne({ deviceId });
  if (!device) {
    return res.status(404).json({ error: "Device not found" });
  } else {
    if (device.pendingUpdate) {
      device.pendingUpdate = false;
      await device.save();
      return res.json({ message: "Update completed successfully" });
    } else {
      return res.json({ message: "Could not mark update completed" });
    }
  }
};
