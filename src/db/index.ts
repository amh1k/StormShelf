import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.URL;
  if (!mongoUrl) {
    throw new Error("URL is not configured");
  }

  const connectionInstance = await mongoose.connect(`${mongoUrl}/stormshelf`);
  console.log(`Connected to DB host: ${connectionInstance.connection.host}`);
};

export default connectDB;
