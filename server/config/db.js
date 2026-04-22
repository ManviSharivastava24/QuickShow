// import mongoose from "mongoose";
// const connectDB=async()=>{
//     try{
//         mongoose.connection.on('connected',()=> console.log('Database connected'));
//         await mongoose.connect(`${process.env.MONGODB_URL}/quickshow`)
//     }catch(error){
//         console.log(error.message);
//     }
// }
// export default connectDB;
// import mongoose from "mongoose";

// let isConnected = false;

// const connectDB = async () => {
//   if (isConnected) return;

//   try {
//     const conn = await mongoose.connect(
//       process.env.MONGODB_URL + "/quickshow"
//     );

//     isConnected = conn.connections[0].readyState === 1;

//     console.log("Database connected ");
//   } catch (error) {
//     console.log("DB Error ", error.message);
//     throw error;
//   }
// };


import mongoose from "mongoose";

const connectDB = async () => {
  // 1. Check if we already have an active connection
  if (mongoose.connection.readyState >= 1) {
    console.log("Database already connected");
    return;
  }

  // 2. Ensure the URL exists
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is missing in environment variables");
  }

  try {
    // 3. Connect to the database
    await mongoose.connect(process.env.MONGODB_URL + "/quickshow", {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5 seconds instead of hanging for 5 mins
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("DB Connection Error: ", error.message);
    throw error;
  }
};

export default connectDB;