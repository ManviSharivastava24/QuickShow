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
import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URL + "/quickshow"
    );

    isConnected = conn.connections[0].readyState === 1;

    console.log("Database connected ");
  } catch (error) {
    console.log("DB Error ", error.message);
    throw error;
  }
};

export default connectDB;