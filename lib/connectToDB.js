import mongoose from "mongoose";
const connectToDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/fota-data");
    console.log("Connected to the database");
    console.log("Yeah");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit process with failure
  }
};
export default connectToDB;
