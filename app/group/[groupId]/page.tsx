import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import "@/models";
import mongoose, { Types } from "mongoose";
import GroupClient from "../[groupId]/GroupClient";
import { getGroupHistory } from "@/lib/queries/group";
import { simplifyDebts } from "@/lib/services/balance";


export default async function GroupPage(props: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await props.params;

  const session = await auth();
  if (!session?.user?.email) redirect("/");

  if (!Types.ObjectId.isValid(groupId)) {
    return <div className="p-8">Invalid group</div>;
  }

  await connectToDatabase();

  // 🔥 models from mongoose registry
  const User = mongoose.models.User;
  const Group = mongoose.models.Group;
  const GroupMember = mongoose.models.GroupMember;
  const LedgerEntry = mongoose.models.LedgerEntry;

  const user = await User.findOne({
    email: session.user.email,
  }).lean();

  if (!user) redirect("/");

  const objectId = new Types.ObjectId(groupId);

  const membership = await GroupMember.findOne({
    groupId: objectId,
    userId: user._id,
  }).lean();

  if (!membership) {
    return <div className="p-8">Not allowed</div>;
  }

  const group = await Group.findById(objectId).lean();

  const members = await GroupMember.find({ groupId: objectId })
    .populate("userId", "name email")
    .lean();

  // 🔥 BALANCES
  const balancesAgg = await LedgerEntry.aggregate([
    { $match: { groupId: objectId } },
    {
      $group: {
        _id: "$userId",
        balance: { $sum: "$delta" },
      },
    },
  ]);

  const balancesMap: Record<string, number> = {};
  balancesAgg.forEach((b: any) => {
    balancesMap[b._id.toString()] = b.balance;
  });

  const formattedMembers = members.map((m: any) => ({
    _id: m._id.toString(),
    role: m.role,
    name: m.userId?.name,
    email: m.userId?.email,
    userId: m.userId?._id?.toString(),
    balance: balancesMap[m.userId?._id?.toString()] || 0,
  }));
  const settlementsToShow = simplifyDebts(
  formattedMembers.map((m) => ({
    name: m.name,
    balance: m.balance,
  }))
);


  // ⭐ HISTORY FETCH (NEW)
  const history = await getGroupHistory(groupId);

  return (
    <GroupClient
      group={{
        _id: group?._id?.toString(),
        name: group?.name,
      }}
      currentUserId={user._id.toString()}
      members={formattedMembers}
      history={history}   // 🔥 pass to client
      settlements={settlementsToShow}
    />
  );
}
