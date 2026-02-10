import Google from "next-auth/providers/google";
import NextAuth from "next-auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GoogleClientID!,
      clientSecret: process.env.GoogleClientSecret!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const newUser = new User({
            email: user.email,

            name: user.name,
          });
          await newUser.save();
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in callback:", error);
        return false;
      }
    },
    
  },
});
