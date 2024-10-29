import mongoose from "mongoose";
const FirmwareSchema = new mongoose.Schema({
  name: String, // e.g., "v1.2.3.bin"
  file: Buffer, // Store binary file data
});

const Firmware = mongoose.model("Firmware", FirmwareSchema);
export default Firmware;
