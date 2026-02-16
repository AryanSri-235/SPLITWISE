"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Member = {
  _id: string;
  role: string;
  name: string;
  email: string;
  userId: string;
  balance: number;
};

type SettlementItem = {
  from: string;
  to: string;
  amount: number;
};

type HistoryItem = {
  type: "expense" | "settlement";
  createdAt: string;
  amount: number;
  title: string;
  user: string;
};

type Props = {
  group: { _id: string; name: string };
  currentUserId: string;
  members: Member[];
  history: HistoryItem[];
  settlements: SettlementItem[];
};

export default function GroupClient({
  group,
  currentUserId,
  members,
  history,
  settlements,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [splitType, setSplitType] = useState<"equal" | "exact">("equal");

  const [selectedMembers, setSelectedMembers] = useState(
    members.map((m) => m.userId)
  );

  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateExpense = async () => {
    if (!amount || selectedMembers.length === 0) return;

    try {
      setLoading(true);

      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group._id,
          amount: Number(amount) * 100,
          description,
          splitType,
          involvedMembers: selectedMembers,
          exactAmounts,
        }),
      });

      setOpen(false);
      setAmount("");
      setDescription("");
      setExactAmounts({});
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {group.name}
            </CardTitle>
            <Button
              className="rounded-xl bg-white text-black hover:bg-zinc-200"
              onClick={() => setOpen(true)}
            >
              Create Expense
            </Button>
          </CardHeader>
        </Card>

        {/* Members */}
        <Card className="bg-zinc-900/60 border-zinc-800 rounded-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex justify-between p-3 rounded-xl bg-zinc-800/40"
              >
                <div>
                  {member.name}
                  {member.userId === currentUserId && (
                    <span className="text-zinc-400"> (You)</span>
                  )}
                </div>
                <div
                  className={
                    member.balance >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  ₹ {(member.balance / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Settlements */}
        <Card className="bg-zinc-900/60 border-zinc-800 rounded-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Who Pays Whom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {settlements.length === 0 && (
              <p className="text-zinc-400">All settled up 🎉</p>
            )}

            {settlements.map((s, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700"
              >
                <span className="font-medium">{s.from}</span> pays{" "}
                <span className="font-medium">{s.to}</span>{" "}
                <span className="text-green-400">
                  ₹ {(s.amount / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* History */}
        <Card className="bg-zinc-900/60 border-zinc-800 rounded-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {history.length === 0 && (
              <p className="text-sm text-zinc-400">No history yet.</p>
            )}

            {history.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700"
              >
                <div className="font-medium">
                  {item.type === "expense"
                    ? `${item.user} added "${item.title}"`
                    : item.title}
                </div>

                <div className="text-sm text-zinc-400">
                  ₹ {(item.amount / 100).toFixed(2)}
                </div>

                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Expense Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="Total Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Input
              className="bg-zinc-800 border-zinc-700"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex gap-3">
              <Button
                variant={splitType === "equal" ? "default" : "outline"}
                onClick={() => setSplitType("equal")}
                className="rounded-xl"
              >
                Equal
              </Button>
              <Button
                variant={splitType === "exact" ? "default" : "outline"}
                onClick={() => setSplitType("exact")}
                className="rounded-xl"
              >
                Exact
              </Button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/40"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.userId)}
                      onChange={() => toggleMember(member.userId)}
                    />
                    {member.name}
                  </label>

                  {splitType === "exact" &&
                    selectedMembers.includes(member.userId) && (
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={exactAmounts[member.userId] || ""}
                        onChange={(e) =>
                          setExactAmounts((prev) => ({
                            ...prev,
                            [member.userId]: e.target.value,
                          }))
                        }
                        className="w-24 bg-zinc-800 border-zinc-700"
                      />
                    )}
                </div>
              ))}
            </div>

            <Button
              className="w-full rounded-xl"
              onClick={handleCreateExpense}
              disabled={loading}
            >
              {loading ? "Creating..." : "Add Expense"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
