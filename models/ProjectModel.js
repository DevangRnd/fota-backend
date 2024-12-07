import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }], // Match with the Vendor model
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

const Project = mongoose.model("Project", ProjectSchema);
export default Project;
