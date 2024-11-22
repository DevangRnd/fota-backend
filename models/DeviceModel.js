import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  firmwareName: {
    type: String,
    default: null, // Store the firmware name in a single field
  },
  pendingUpdate: {
    type: Boolean,
    default: false, // Default to false
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

DeviceSchema.virtual("firmwareStatus").get(function () {
  return this.pendingUpdate
    ? `Pending (${this.firmwareName})`
    : this.firmwareName
    ? `Completed (${this.firmwareName})`
    : `Null`;
});

// Ensure virtual fields are serialized
DeviceSchema.set("toJSON", { virtuals: true });
DeviceSchema.set("toObject", { virtuals: true });

const Device = mongoose.model("Device", DeviceSchema);
export default Device;
