import mongoose from "mongoose";

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Initial DB connection successful");
  } catch (err) {
    console.error("Initial DB connection failed", err);
    throw err;
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
}
