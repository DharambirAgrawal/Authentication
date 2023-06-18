import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MONGODB CONNECTED");
  } catch (err) {
    console.log(`Error: ${conn.connection.host}`);
    process.exit();
  }
};
