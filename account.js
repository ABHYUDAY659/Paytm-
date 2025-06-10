import mongoose from 'mongoose';
import express from 'express';
import { AccountModel } from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    try {
      const account = await AccountModel.findOne({
        userId: req.userId
      });
  
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
  
      res.json({
        balance: account.balance
      });
    } catch (error) {
      console.error("Balance fetch error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

    router.post("/transfer", authMiddleware, async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const { amount, to } = req.body;
    
            const fromAcc = await AccountModel.findOne({ userId: req.userId }).session(session);
            const toAcc = await AccountModel.findOne({ userId: to }).session(session);
    
            if (!fromAcc || fromAcc.balance < amount) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Not enough balance" });
            }
    
            if (!toAcc) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Receiver not found" });
            }
    
            fromAcc.balance -= amount;
            toAcc.balance += amount;
    
            await fromAcc.save({ session });
            await toAcc.save({ session });
    
            await session.commitTransaction();
            res.json({ message: "Transfer successful" });
        } catch (err) {
            await session.abortTransaction();
            res.status(500).json({ message: "Something went wrong" });
        } finally {
            session.endSession();
        }
    });
    

export default router;
