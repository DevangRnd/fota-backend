import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    firmwareName: {
      type: String,
      default: null,
    },
    signalStrength: {
      type: Number,
      default: null,
    },
    pendingUpdate: {
      type: Boolean,
      default: false,
    },
    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: "Vendor", // Proper reference to Vendor
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
    lastUpdated: {
      type: Date,
      default: null,
    },
    uploadedOn: {
      type: Date,
      default: () => new Date(), // Proper function to ensure dynamic default
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

// Virtual field
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
