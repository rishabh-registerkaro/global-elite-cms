
import mongoose from "mongoose";

const MONGO_URI=process.env.MONGO_URI as string;
const DB_NAME=process.env.DB_NAME as string;

export const connectDB=async()=>{
    try{
      if(mongoose.connection.readyState>=1){
        console.log("MongoDB is already connected");
        return;
      }
      await mongoose.connect(MONGO_URI,{dbName:DB_NAME});
      console.log("MongoDB connection established successfully");
    }
    catch(error){
        console.log("MongoDB connection failed",error);
        throw error;
    }
}