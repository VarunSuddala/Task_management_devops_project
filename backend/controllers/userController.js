const User = require("../models/User");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "name email _id").sort({ name: 1 });
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "name email role _id");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getUsers, getMe };
