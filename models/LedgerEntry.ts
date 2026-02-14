import mongoose, { Schema, Types } from "mongoose";

const LedgerEntrySchema = new Schema(
  {
    groupId: {
      type: Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    delta: {
      type: Number,
      required: true, // +credit, -debit (stored in paise)
    },

    sourceType: {
      type: String,
      enum: ["expense", "settlement"],
      required: true,
    },

    sourceId: {
      type: Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

/*
🔥 CRITICAL INDEX
Most common query:
"What is balance of user X in group Y?"

We must optimize for that.
*/
LedgerEntrySchema.index({ groupId: 1, userId: 1 });

/*
Optional: optimize audit-style queries
*/
LedgerEntrySchema.index({ sourceType: 1, sourceId: 1 });

const LedgerEntry =
  mongoose.models.LedgerEntry ||
  mongoose.model("LedgerEntry", LedgerEntrySchema);

export default LedgerEntry;
