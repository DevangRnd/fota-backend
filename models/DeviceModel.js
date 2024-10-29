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
});

const Device = mongoose.model("Device", DeviceSchema);
export default Device;
