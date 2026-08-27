import mongoose from "mongoose";


async function connectDB() {
    try {
        const mongoUri = process.env.MONGODB_URL;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        await mongoose.connect(mongoUri);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

export default connectDB;