// models/Expense.ts
import mongoose, { Schema, Types } from "mongoose";

const ExpenseSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: "Group", index: true },
    paidBy: { type: Types.ObjectId, ref: "User", required: true },
    amount: {
      type: Number,
      required: true,
      min: 1, // stored in paise
    },
    currency: { type: String, default: "INR" },
    description: String,
    splitType: {
      type: String,
      enum: ["equal", "percentage", "exact"],
      required: true,
    },
    isDeleted: { type: Boolean, default: false }, // soft delete
  },
  { timestamps: true }
);

const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
export default Expense;