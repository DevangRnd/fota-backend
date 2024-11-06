import express from "express";
import connectToDB from "./lib/connectToDB.js";
import { configDotenv } from "dotenv";
import cors from "cors";
import firmwareRoutes from "./routes/firmwareRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
const app = express();
app.use(cors());
configDotenv();

// Connect to the database
connectToDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api", firmwareRoutes);
app.use("/api", deviceRoutes);
app.use("/api", authRoutes);
app.get("/api/test", (req, res) => {
  return res.json({ message: "Success" });
});

// Start the server
app.listen(7070, () => {
  console.log(`App is running on port 7070`);
});
