import mongoose from "mongoose";

mongoose
  .connect("mongodb+srv://rrifa0609:rifa08@cluster0.6tvpjqi.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("Connected!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });