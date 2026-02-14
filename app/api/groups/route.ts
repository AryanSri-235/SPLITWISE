import mongoose from "mongoose";
import crypto from "crypto";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectToDatabase();

  const { groupName } = await request.json();
  if (!groupName?.trim()) {
    return new Response("Group name required", { status: 400 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const token = crypto.randomBytes(8).toString("hex");

    const [group] = await Group.create(
      [
        {
          name: groupName.trim(),
          token,
          createdBy: user._id,
        },
      ],
      { session: dbSession }
    );

    await GroupMember.create(
      [
        {
          groupId: group._id,
          userId: user._id,
          role: "admin",
        },
      ],
      { session: dbSession }
    );

    await dbSession.commitTransaction();
    dbSession.endSession();

    return Response.json(
      {
        groupId: group._id.toString(),
        joinLink: `/join/${token}`,
      },
      { status: 201 }
    );
  } catch (err) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    return new Response("Failed to create group", { status: 500 });
  }
}
