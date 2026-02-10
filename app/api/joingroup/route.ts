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


try {
const { token } = await request.json();


if (!token?.trim()) {
return new Response("Token required", { status: 400 });
}


const dbUser = await User.findOne({
email: session.user.email,
});


if (!dbUser) {
return new Response("User not found", { status: 404 });
}


const group = await Group.findOne({
token: token.trim(),
});


if (!group) {
return new Response("Invalid token", { status: 404 });
}


// ⭐ Prevent duplicate membership
const existingMembership = await GroupMember.findOne({
groupId: group._id,
userId: dbUser._id,
});


if (!existingMembership) {
await GroupMember.create({
groupId: group._id,
userId: dbUser._id,
role: "member",
});
}


return Response.json({
groupId: group._id,
});


} catch (error) {
console.error("Error joining group:", error);
return new Response("Failed to join group", { status: 500 });
}
}