const express = require("express");
const { getCommentsForTask, addComment, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/task/:taskId", getCommentsForTask);
router.post("/task/:taskId", addComment);
router.delete("/:id", deleteComment);

module.exports = router;
