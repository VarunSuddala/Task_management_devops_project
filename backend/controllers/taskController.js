const Task = require("../models/Task");
const Project = require("../models/Project");
const Comment = require("../models/Comment");
const { z } = require("zod");

const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]).optional(),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  dueDate: z.string().optional(),
  assignedUser: z.string().optional(),
  projectId: z.string().trim().min(1, "Project ID is required"),
});

const taskUpdateSchema = taskCreateSchema.omit({ projectId: true }).partial();

const verifyProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember =
    project.owner.toString() === userId ||
    project.members.map((m) => m.toString()).includes(userId);
  return isMember ? project : null;
};

const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedUser } = req.query;
    if (!projectId)
      return res.status(400).json({ message: "projectId is required" });

    const project = await verifyProjectAccess(projectId, req.user.id);
    if (!project) return res.status(403).json({ message: "Access denied" });

    const filter = { projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedUser) filter.assignedUser = assignedUser;

    const tasks = await Task.find(filter)
      .populate("assignedUser", "name email")
      .populate("reporter", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const result = taskCreateSchema.safeParse(req.body);
    if (!result.success)
      return res.status(400).json({ message: result.error.errors[0].message });

    const { projectId } = result.data;
    const project = await verifyProjectAccess(projectId, req.user.id);
    if (!project) return res.status(403).json({ message: "Access denied" });

    const task = await Task.create({
      ...result.data,
      reporter: req.user.id,
    });

    const populated = await Task.findById(task._id)
      .populate("assignedUser", "name email")
      .populate("reporter", "name email");

    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const result = taskUpdateSchema.safeParse(req.body);
    if (!result.success)
      return res.status(400).json({ message: result.error.errors[0].message });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await verifyProjectAccess(
      task.projectId.toString(),
      req.user.id
    );
    if (!project) return res.status(403).json({ message: "Access denied" });

    const updated = await Task.findByIdAndUpdate(req.params.id, result.data, {
      new: true,
      runValidators: true,
    })
      .populate("assignedUser", "name email")
      .populate("reporter", "name email");

    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await verifyProjectAccess(
      task.projectId.toString(),
      req.user.id
    );
    if (!project) return res.status(403).json({ message: "Access denied" });

    await Task.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ task: req.params.id });

    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
