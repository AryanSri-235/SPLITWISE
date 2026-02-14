import mongoose, { Schema, Types } from "mongoose";

const SettlementSchema = new Schema(
  {
    groupId: {
      type: Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    from: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    to: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true, // paise
      min: 1,
    },

    note: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "completed",
    },
  },
  { timestamps: true }
);

/*
🔥 Compound Indexes for Fast Queries
*/

// Get all settlements inside a group
SettlementSchema.index({ groupId: 1, createdAt: -1 });

// Get settlements between two users in group
SettlementSchema.index({ groupId: 1, from: 1, to: 1 });

// For user activity history
SettlementSchema.index({ from: 1 });
SettlementSchema.index({ to: 1 });

const Settlement =
  mongoose.models.Settlement ||
  mongoose.model("Settlement", SettlementSchema);

export default Settlement;
