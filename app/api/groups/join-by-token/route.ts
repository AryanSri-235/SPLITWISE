import { connectToDatabase } from "@/lib/db";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectToDatabase();

  const { token } = await request.json();
  if (!token?.trim()) {
    return new Response("Token required", { status: 400 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) return new Response("User not found", { status: 404 });

  const group = await Group.findOne({ token: token.trim() });
  if (!group) return new Response("Invalid invite link", { status: 404 });

  try {
    await GroupMember.create({
      groupId: group._id,
      userId: user._id,
      role: "member",
    });
  } catch (err: any) {
    if (err.code !== 11000) throw err;
  }

  return Response.json({
    groupId: group._id.toString(),
  });
}
