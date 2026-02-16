"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  name?: string | null;
  email?: string | null;
};

type GroupType = {
  _id: string;
  name: string;
};

type DashboardProps = {
  user?: User | null;
  groups: GroupType[];
};

export default function DashboardClient({ user, groups }: DashboardProps) {
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [token, setToken] = useState("");
  const [groupName, setGroupName] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmGroupCreation = async () => {
    if (!groupName.trim()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setJoinLink(data.joinLink);
      setNotification("Group created successfully 🎉");
    } catch {
      setNotification("Failed to create group");
      setTimeout(() => setNotification(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinLink);
    setNotification("Invite link copied!");
    setTimeout(() => setNotification(""), 2000);
  };

  const joinGroup = async () => {
    if (!token.trim()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/groups/join-by-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok || !data?.groupId) throw new Error();

      setJoinOpen(false);
      router.push(`/group/${data.groupId}`);
    } catch {
      setNotification("Invalid token or failed to join");
      setTimeout(() => setNotification(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-zinc-400">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Notification */}
        {notification && (
          <div className="bg-green-600/90 backdrop-blur px-5 py-3 rounded-xl shadow-lg animate-in fade-in">
            {notification}
          </div>
        )}

        {/* Welcome Card */}
        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Welcome, {user.name ?? "User"} 👋
            </CardTitle>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </CardHeader>
        </Card>

        {/* Groups */}
        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl rounded-2xl">
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {groups.length === 0 && (
              <p className="text-sm text-zinc-400">
                You are not part of any groups yet.
              </p>
            )}

            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => router.push(`/group/${group._id}`)}
                className="p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition cursor-pointer border border-transparent hover:border-zinc-700"
              >
                {group.name}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            className="rounded-xl bg-white text-black hover:bg-zinc-200 font-medium"
            onClick={() => setCreateOpen(true)}
          >
            Create Group
          </Button>

          <Button
            variant="outline"
            className="rounded-xl border-zinc-700 hover:bg-zinc-800"
            onClick={() => setJoinOpen(true)}
          >
            Join Group
          </Button>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <Button className="w-full rounded-xl" onClick={confirmGroupCreation}>
              {loading ? "Creating..." : "Create Group"}
            </Button>

            {joinLink && (
              <>
                <p className="text-sm text-zinc-400">Share this invite link:</p>

                <div className="p-3 bg-zinc-800 rounded-lg text-sm break-all">
                  {joinLink}
                </div>

                <Button variant="secondary" className="w-full" onClick={copyLink}>
                  Copy Invite Link
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* JOIN DIALOG */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Join Group</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="Enter group token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button onClick={joinGroup}>
              {loading ? "Joining..." : "Join"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
