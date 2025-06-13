import express from "express";
import bcrypt from "bcrypt";
import { AccountModel, UserModel } from "../db.js";
import { JWT_SECRET } from "../config.js";
import jwt from 'jsonwebtoken';
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { firstname, lastname, username, password } = req.body;

  const existingUser = await UserModel.findOne({ username });

  if (existingUser) {
    return res.status(400).json({ message: "Username already taken" });
  }

  const hashedPassword = await bcrypt.hash(password, 5);

  const newUser = await UserModel.create({
    firstname,
    lastname,
    username,
    password: hashedPassword
  });

  await AccountModel.create({
    userId: newUser._id,
    balance: Math.floor(1 + Math.random() * 10000)
  });

  res.json({ message: "Signed up and account created!" });
});

// Signin
router.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Incorrect credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Incorrect credentials" });
  }

  const token = jwt.sign({ username, userId: user._id }, JWT_SECRET);
  res.json({ message: "Signed in!", token });
});

// Update profile
router.put("/", authMiddleware, async (req, res) => {
  const { firstName, lastName } = req.body;

  if (!firstName && !lastName) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  await UserModel.updateOne(
    { _id: req.userId },
    { $set: req.body }
  );

  res.json({ message: "Updated successfully" });
});

// Get users in bulk
router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await UserModel.find({
    $or: [
      { firstname: { $regex: filter, $options: "i" } },
      { lastname: { $regex: filter, $options: "i" } }
    ]
  });

  res.json(users.map(user => ({
    username: user.username,
    firstName: user.firstname,
    lastName: user.lastname,
    _id: user._id
  })));
});

export default router;
