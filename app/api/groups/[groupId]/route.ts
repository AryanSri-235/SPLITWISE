import { connectToDatabase } from "@/lib/db";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import LedgerEntry from "@/models/LedgerEntry";
import User from "@/models/User";
import { auth } from "@/auth";
import { Types } from "mongoose";

export async function GET(
  request: Request,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params;

  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!Types.ObjectId.isValid(groupId)) {
    return new Response("Invalid group ID", { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return new Response("User not found", { status: 404 });

  const objectId = new Types.ObjectId(groupId);

  const membership = await GroupMember.findOne({
    groupId: objectId,
    userId: user._id,
  });

  if (!membership) {
    return new Response("Forbidden", { status: 403 });
  }

  const group = await Group.findById(objectId);

  const members = await GroupMember.find({ groupId: objectId })
    .populate("userId", "name email");

  const balances = await LedgerEntry.aggregate([
    { $match: { groupId: objectId } },
    {
      $group: {
        _id: "$userId",
        balance: { $sum: "$delta" },
      },
    },
  ]);

  return Response.json({ group, members, balances });
}
