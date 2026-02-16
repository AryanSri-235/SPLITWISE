import mongoose, { Schema, Types } from "mongoose";

const SettlementSchema = new Schema(
  {
    groupId: {
      type: Types.ObjectId,
      ref: "Group",
      required: true,
    },

    from: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
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

/* 🔥 Indexes */

SettlementSchema.index({ groupId: 1, createdAt: -1 });
SettlementSchema.index({ groupId: 1, from: 1, to: 1 });
SettlementSchema.index({ from: 1 });
SettlementSchema.index({ to: 1 });

const Settlement =
  mongoose.models.Settlement ||
  mongoose.model("Settlement", SettlementSchema);

export default Settlement;
