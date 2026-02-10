// models/ExpenseSplit.ts
import mongoose, { Schema, Types } from "mongoose";

const ExpenseSplitSchema = new Schema(
  {
    expenseId: { type: Types.ObjectId, ref: "Expense", index: true },
    userId: { type: Types.ObjectId, ref: "User", index: true },
    amount: {
      type: Number,
      required: true, // paise
    },
  },
  { timestamps: true }
);

ExpenseSplitSchema.index(
  { expenseId: 1, userId: 1 },
  { unique: true }
);

const ExpenseSplit = mongoose.models.ExpenseSplit || mongoose.model("ExpenseSplit", ExpenseSplitSchema);
export default ExpenseSplit;
