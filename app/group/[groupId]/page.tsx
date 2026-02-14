
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import LedgerEntry from "@/models/LedgerEntry";
import User from "@/models/User";
import { Types } from "mongoose";

export default async function GroupPage(props: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await props.params;

  const session = await auth();
  if (!session?.user?.email) redirect("/");

  if (!Types.ObjectId.isValid(groupId)) {
    return <div>Invalid group</div>;
  }

  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return <div>User not found</div>;

  const objectId = new Types.ObjectId(groupId);

  const membership = await GroupMember.findOne({
    groupId: objectId,
    userId: user._id,
  });

  if (!membership) return <div>Not allowed</div>;

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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{group?.name}</h1>
      {members.map((member: any) => {
        const balanceObj = balances.find(
          (b: any) =>
            b._id.toString() === member.userId._id.toString()
        );

        const balance = balanceObj ? balanceObj.balance : 0;

        return (
          <div key={member._id} className="flex justify-between">
            <span>{member.userId.name}</span>
            <span>₹ {(balance / 100).toFixed(2)}</span>
          </div>
        );
      })}
    </div>
  );
}
