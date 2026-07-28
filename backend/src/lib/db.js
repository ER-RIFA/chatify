import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const { MONGO_URI } = process.env;
        if (MONGO_URI) throw new Error ("MONGO_URI is not set");
        console.log(process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGOBD CONNECTED : ", conn.connection.host);
    } catch (error) {
        console.log("Error connection to MONGODB : ", error);
        process.exit(1);
        //1 status code means fail, 0 means success
    }
}