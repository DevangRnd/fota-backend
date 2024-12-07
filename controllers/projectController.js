import Project from "../models/ProjectModel.js";
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).populate("vendors");

    res.status(200).json({ projects });
  } catch (error) {
    res.status(404).json({ message: "Error Fetching Projects" });
  }
};
export const createProject = async (req, res) => {
  const { name } = req.body;
  try {
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res
        .status(404)
        .json({ message: "Project with this name already exists" });
    }
    const newProject = new Project({ name });
    await newProject.save();
    res.status(201).json({ newProject });
  } catch (error) {
    res.status(404).json({ message: "Error creating project" });
  }
};
