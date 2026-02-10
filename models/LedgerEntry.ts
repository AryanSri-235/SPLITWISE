// models/LedgerEntry.ts
import mongoose, { Schema, Types } from "mongoose";
const LedgerEntrySchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: "Group", index: true },
    userId: { type: Types.ObjectId, ref: "User", index: true },
    delta: Number, // + or -
    sourceType: {
      type: String,
      enum: ["expense", "settlement"],
    },
    sourceId: Types.ObjectId,
  },
  { timestamps: true }
);

const LedgerEntry = mongoose.models.LedgerEntry || mongoose.model("LedgerEntry", LedgerEntrySchema);
export default LedgerEntry;