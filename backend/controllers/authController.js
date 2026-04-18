const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const SALT_ROUNDS = 10;

// Zod schemas for validation
const registerSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().trim().toLowerCase().email({ message: "Invalid email format" }),
  password: z.string().trim().min(6, { message: "Password must be at least 6 characters" })
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: "Invalid email format" }),
  password: z.string().trim().min(1, { message: "Password is required" })
});

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

const registerUser = async (req, res, next) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    const { name, email: normalizedEmail, password: trimmedPassword } = validationResult.data;

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);
    const user = await User.create({ name, email: normalizedEmail, password: hashedPassword });

    return res.status(201).json({
      message: "User registered successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      return res.status(400).json({ message: errorMessage });
    }

    const { email: normalizedEmail, password: trimmedPassword } = validationResult.data;

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
