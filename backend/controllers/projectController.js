const Project = require("../models/Project");
const Task = require("../models/Task");
const { z } = require("zod");

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional(),
});

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email");
    return res.status(200).json(projects);
  } catch (error) {
    return next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember =
      project.owner._id.toString() === req.user.id ||
      project.members.some((m) => m._id.toString() === req.user.id);

    if (!isMember) return res.status(403).json({ message: "Access denied" });

    return res.status(200).json(project);
  } catch (error) {
    return next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const result = projectSchema.safeParse(req.body);
    if (!result.success)
      return res.status(400).json({ message: result.error.errors[0].message });

    const project = await Project.create({
      ...result.data,
      owner: req.user.id,
      members: [req.user.id],
    });

    const populated = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const result = projectSchema.partial().safeParse(req.body);
    if (!result.success)
      return res.status(400).json({ message: result.error.errors[0].message });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      result.data,
      { new: true }
    )
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    return res.status(200).json(project);
  } catch (error) {
    return next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });

    await Task.deleteMany({ projectId: req.params.id });
    return res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    return next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $addToSet: { members: userId } },
      { new: true }
    )
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    return res.status(200).json(project);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
};
