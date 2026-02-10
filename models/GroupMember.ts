// models/GroupMember.ts
import mongoose, { Schema, Types } from "mongoose";

const GroupMemberSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: "Group", index: true },
    userId: { type: Types.ObjectId, ref: "User", index: true },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

const GroupMember = mongoose.models.GroupMember || mongoose.model("GroupMember", GroupMemberSchema);
export default GroupMember;