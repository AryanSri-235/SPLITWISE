"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function DashboardClient({ user }: { user?: User | null }) {
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [token, setToken] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [groupName, setGroupName] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- CREATE GROUP ----------

  const generateToken = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 10);
  };

  const createGroup = () => {
    if (!groupName.trim()) return;
    const newToken = generateToken();
    setGeneratedToken(newToken);
  };

  const confirmGroupCreation = async () => {
    if (!groupName || !generatedToken) return;

    try {
      setLoading(true);

      const res = await fetch("/api/creategroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName,
          token: generatedToken,
        }),
      });

      if (!res.ok) throw new Error("Failed to create group");

      const group = await res.json();

      setNotification(`${groupName} created successfully 🎉`);

      // Reset modal
      setGroupName("");
      setGeneratedToken("");
      setCreateOpen(false);

      // Redirect to group page
        router.push(`/group/${group.groupId}`);
    } catch (err) {
      console.error(err);
      setNotification("Failed to create group");
      setTimeout(() => setNotification(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(generatedToken);
      setNotification("Token copied!");
      setTimeout(() => setNotification(""), 2000);
    } catch {
      console.warn("Clipboard not supported");
    }
  };

  // ---------- JOIN GROUP ----------

  const joinGroup = async () => {
    if (!token.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/joingroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      // Handle non-JSON responses safely
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok || !data?.groupId) {
        throw new Error("Invalid token");
      }

      setNotification("Joined group successfully 🎉");

      setJoinOpen(false);
      setToken("");

      router.push(`/group/${data.groupId}`);
    } catch (err) {
      console.error(err);
      setNotification("Invalid token or failed to join");
      setTimeout(() => setNotification(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  // ---------- GUARD ----------

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

  // ---------- UI ----------

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
      {notification && (
        <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg">
          {notification}
        </div>
      )}

      <Card className="w-[500px] shadow-xl rounded-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              Welcome, {user.name ?? "User"}
            </h1>
            <p className="text-gray-500">{user.email ?? ""}</p>
          </div>

          {/* CREATE GROUP */}
          <Button
            onClick={() => setCreateOpen(true)}
            className="w-full text-lg py-6"
          >
            Create a Group
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />

                <Button className="w-full" onClick={createGroup}>
                  Generate Token
                </Button>

                {generatedToken && (
                  <>
                    <p className="text-sm text-gray-500">
                      Share this token with friends:
                    </p>

                    <div className="p-3 bg-gray-100 rounded-lg font-mono break-all">
                      {generatedToken}
                    </div>

                    <Button className="w-full" onClick={copyToken}>
                      Copy Token
                    </Button>

                    <Button
                      className="w-full"
                      onClick={confirmGroupCreation}
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Confirm Group Creation"}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* JOIN GROUP */}
          <Button
            variant="outline"
            className="w-full text-lg py-6"
            onClick={() => setJoinOpen(true)}
          >
            Join a Group
          </Button>

          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Group</DialogTitle>
              </DialogHeader>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter group token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <Button onClick={joinGroup} disabled={loading}>
                  {loading ? "Joining..." : "Join"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
