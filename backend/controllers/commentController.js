const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { z } = require("zod");

const commentSchema = z.object({
  text: z.string().trim().min(1, "Comment text is required"),
});

const getCommentsForTask = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("user", "name email")
      .sort({ createdAt: 1 });
    return res.status(200).json(comments);
  } catch (error) {
    return next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const result = commentSchema.safeParse(req.body);
    if (!result.success)
      return res.status(400).json({ message: result.error.errors[0].message });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = await Comment.create({
      text: result.data.text,
      task: req.params.taskId,
      user: req.user.id,
    });

    await Task.findByIdAndUpdate(req.params.taskId, {
      $inc: { commentCount: 1 },
    });

    const populated = await Comment.findById(comment._id).populate(
      "user",
      "name email"
    );
    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!comment)
      return res
        .status(404)
        .json({ message: "Comment not found or unauthorized" });

    await Task.findByIdAndUpdate(comment.task, { $inc: { commentCount: -1 } });
    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getCommentsForTask, addComment, deleteComment };
