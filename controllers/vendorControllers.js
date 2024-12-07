import Project from "../models/ProjectModel.js";
import Vendor from "../models/VendorModel.js";
export const createVendor = async (req, res) => {
  const { projectId } = req.params;
  const { vendorName } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project Not Found" });
    }
    const newVendor = new Vendor({ name: vendorName });
    await newVendor.save();
    project.vendors.push(newVendor._id);
    await project.save();
    res.status(201).json({ newVendor });
  } catch (error) {
    res.status(404).json({ message: "Error while creating the vendor" });
  }
};

export const getVendorsForAProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId).populate("vendors");

    if (!project) {
      return res.status(404).json({ message: "Project Not Found" });
    }
    return res.status(200).json({vendors:project.vendors});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while fetching vendors", error: error.message });
  }
};
