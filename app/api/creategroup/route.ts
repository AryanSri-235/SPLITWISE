

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
const { groupName, token } = await request.json();


if (!groupName?.trim()) {
return new Response("Group name required", { status: 400 });
}


const dbUser = await User.findOne({
email: session.user.email,
});


if (!dbUser) {
return new Response("User not found", { status: 404 });
}




const group = await Group.create({
name: groupName.trim(),
token,
createdBy: dbUser._id,
});


// ⭐ Add creator as admin
await GroupMember.create({
groupId: group._id,
userId: dbUser._id,
role: "admin",
});


return Response.json({
groupId: group._id,
token,
}, { status: 201 });


} catch (error) {
console.error("Error creating group:", error);
return new Response("Failed to create group", { status: 500 });
}
}



