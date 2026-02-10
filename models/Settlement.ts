// models/Settlement.ts
import mongoose, { Schema, Types } from "mongoose";

const SettlementSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: "Group", index: true },
    from: { type: Types.ObjectId, ref: "User", required: true },
    to: { type: Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true }, // paise
    note: String,
  },
  { timestamps: true }
);

const Settlement = mongoose.models.Settlement || mongoose.model("Settlement", SettlementSchema);    
export default Settlement;