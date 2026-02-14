import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";

export default async function JoinPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;

  const session = await auth();
  if (!session?.user?.email) redirect("/");

  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email });
  const group = await Group.findOne({ token });

  if (!group) return <div>Invalid invite link</div>;

  try {
    await GroupMember.create({
      groupId: group._id,
      userId: user._id,
      role: "member",
    });
  } catch {}

  redirect(`/group/${group._id}`);
}
