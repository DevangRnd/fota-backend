import express from "express";
import connectToDB from "./lib/connectToDB.js";
import dotenv from "dotenv";
import cors from "cors";
import firmwareRoutes from "./routes/firmwareRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
const app = express();
app.use(cors());
dotenv.config();

// Connect to the database
connectToDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api", firmwareRoutes);
app.use("/api", deviceRoutes);
app.use("/api", authRoutes);
app.use("/api", projectRoutes);
app.use("/api", vendorRoutes);

// Start the server
app.listen(7070, () => {
  console.log(`App is running on port 7070`);
});
