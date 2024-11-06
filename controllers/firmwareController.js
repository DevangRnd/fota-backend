import Firmware from "../models/FirmwareModel.js";

export const uploadFirmware = async (req, res) => {
  const { name } = req.body;
  if (!req.file || !name) {
    return res
      .status(400)
      .json({ error: "Firmware file and name are required" });
  }

  try {
    await Firmware.deleteMany({});
    const newFirmware = new Firmware({ name, file: req.file.buffer });
    await newFirmware.save();
    res.json({
      message: "Firmware uploaded successfully",
      firmwareId: newFirmware._id,
      name,
    });
  } catch (error) {
    console.error("Error saving firmware:", error);
    res.status(500).json({ error: "Failed to upload firmware" });
  }
};

export const getAllFirmwares = async (req, res) => {
  try {
    const allFirmwares = await Firmware.find({}, "name _id");
    res.json({ allFirmwares });
  } catch (error) {
    console.error("Error retrieving firmwares:", error);
    res.status(500).json({ error: "Failed to retrieve firmware list" });
  }
};

export const downloadFirmware = async (req, res) => {
  try {
    const firmware = await Firmware.findOne().sort({ createdAt: -1 });
    if (!firmware) {
      return res
        .status(404)
        .json({ error: "No firmware available for download" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${firmware.name}`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(firmware.file);
  } catch (error) {
    console.error("Error downloading firmware:", error);
    res.status(500).json({ error: "Failed to download firmware" });
  }
};
