import mongoose from "mongoose";
const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }], // Match with the Device model
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", VendorSchema);
export default Vendor;
