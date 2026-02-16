import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import "@/models"; // 🔥 register all models
import mongoose from "mongoose";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  await connectToDatabase();

  // models from mongoose registry
  const User = mongoose.models.User;
  const GroupMember = mongoose.models.GroupMember;

  const user = await User.findOne({
    email: session.user.email,
  }).lean();

  if (!user) {
    redirect("/api/auth/signin");
  }

  const memberships = await GroupMember.find({
    userId: user._id,
  })
    .populate("groupId", "name")
    .lean();

  const groups = memberships.map((m: any) => ({
    _id: m.groupId?._id?.toString(),
    name: m.groupId?.name,
  }));

  return (
    <DashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      groups={groups}
    />
  );
}
