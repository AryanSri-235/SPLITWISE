import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "../dashboard/DashboardClient";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <DashboardClient user={session.user} />;
}
