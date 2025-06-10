import express from "express";
import bcrypt from "bcrypt";
import { AccountModel, UserModel } from "../db.js";  
import { JWT_SECRET } from "../config.js";
import jwt from 'jsonwebtoken';
import authMiddleware from "../middleware/auth.js";

const router = express.Router();



router.post('/signup', async (req, res) => {
    try {
      const { firstname, lastname, username, password } = req.body;
  
      console.log("Incoming signup:", req.body); // Debug
  
      const existingUser = await UserModel.findOne({ username });
      console.log("Existing user:", existingUser); // Debug
  
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 5);
  
      // Create the user
      const newUser = await UserModel.create({
        firstname,
        lastname,
        username,
        password: hashedPassword
      });
  
      // Create their account with random balance
      await AccountModel.create({
        userId: newUser._id,
        balance: Math.floor(1 + Math.random() * 10000)
      });
  
      res.json({ message: "Signed up and account created!" });
  
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  
  

  router.post('/signin' , async(req, res) =>{
    try {
        const { username, password } = req.body;
    
        const user = await UserModel.findOne({ username });
        if (!user) {
          return res.status(401).json({ message: "Incorrect credentials" });
        }
    
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return res.status(401).json({ message: "Incorrect credentials" });
        }
    
        const token = jwt.sign({ username, userId: user._id}, JWT_SECRET);
        res.json({ message: "Signed in!", token });
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    router.put("/", authMiddleware, async (req, res) => {
        const { firstName, lastName } = req.body;
      
        // Optional: Simple manual validation
        if (!firstName && !lastName) {
          return res.status(400).json({
            message: "Nothing to update",
          });
        }
      
        try {
          await User.updateOne(
            { _id: req.userId },      // Find user by ID from auth middleware
            { $set: req.body }        // Apply updates
          );
      
          res.json({
            message: "Updated successfully",
          });
        } catch (error) {
          res.status(500).json({
            message: "Something went wrong while updating",
          });
        }
      });
      
      router.get("/bulk", async (req, res) => {
        const filter = req.query.filter || "";
      
        try {
          const users = await User.find({
            $or: [
              { firstName: { $regex: filter, $options: "i" } },
              { lastName: { $regex: filter, $options: "i" } }
            ]
          });
      
          res.json(users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
          })));
        } catch (err) {
          res.status(500).json({ message: "Something went wrong" });
        }
      });
      
  
   
export default router;  
