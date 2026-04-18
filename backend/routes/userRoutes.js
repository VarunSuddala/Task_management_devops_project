const express = require("express");
const { getUsers, getMe } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", getUsers);
router.get("/me", getMe);

module.exports = router;
