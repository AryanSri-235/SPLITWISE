// models/AuditLog.ts
import mongoose, { Schema, Types } from "mongoose";
const AuditLogSchema = new Schema(
  {
    actorId: { type: Types.ObjectId, ref: "User" }, //Who performed the action
    action: String, // e.g. "create_expense", "update_group", etc.
    entityType: String, // e.g. "Expense", "Group", etc.
    entityId: Types.ObjectId, // ID of the affected document
    meta: Schema.Types.Mixed, // Any additional info (e.g. changes made)
  },
  { timestamps: true }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;