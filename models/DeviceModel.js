import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  currentFirmware: {
    type: String,
    default: null, // Default to null until a new firmware is added
  },
  pendingUpdate: {
    type: Boolean,
    default: false, // Default to false
  },
  targetFirmwareName: {
    type: String,
    default: null, // Default to null until set
  },
  vendor: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  block: {
    type: String,
    required: true,
  },
  panchayat: {
    type: String,
    required: true,
  },
});

const Device = mongoose.model("Device", DeviceSchema);
export default Device;
