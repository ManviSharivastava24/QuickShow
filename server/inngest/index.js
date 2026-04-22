// import { Inngest } from "inngest";
// import User from "../models/user.js";
// import connectDB from "../config/db.js";
// import mongoose from "mongoose";
// // Create a client to send and receive events
// export const inngest = new Inngest({ id: "movie-ticket-booking" });
// //ingest function to save user data to a database
// const syncUserCreation =inngest.createFunction(
//     {id:'sync-user-from-clerk',
//     triggers: [{ event: 'clerk/user.created' }]
// },
//     async({event})=>{
//         await connectDB();
//         if (mongoose.connection.readyState !== 1) {
//             throw new Error("DB not connected");
//           }
//         const{id,first_name,last_name,email_addresses,image_url}=event.data
//         const userData={
//             _id:id,
//             email: email_addresses?.[0]?.email_address || "",
//             name:first_name+' '+last_name,
//             image:image_url
//         }
//         await User.create(userData)
//     }
// )
// //function to delete user from database

// const syncUserDeletion =inngest.createFunction(
//     {id:'delete-user-from-clerk',
//     triggers: [{ event: 'clerk/user.deleted' }]
// },
//     async({event})=>{
//         await connectDB(); 
//         if (mongoose.connection.readyState !== 1) {
//             throw new Error("DB not connected");
//           }
//             const{id}=event.data
//             await User.findByIdAndUpdate(id, userData, { upsert: true, new: true });
//         }
// )
// //updtae user data
// const syncUserUpdation =inngest.createFunction(
//     {id:'update-user-from-clerk',
//     triggers: [{ event: 'clerk/user.updated' }]},
//     async({event})=>{
//         await connectDB(); 
//         if (mongoose.connection.readyState !== 1) {
//             throw new Error("DB not connected");
//           }
//         const{id,first_name,last_name,email_addresses,image_url}=event.data
//              const userData={
                
//                 email: email_addresses?.[0]?.email_address || "",
//                 name:first_name+' '+last_name,
//                 image:image_url
//              }
//             await User.findByIdAndUpdate(id, userData, { upsert: true });
        
       
//         }
// )
// // Create an empty array where we'll export future Inngest functions
// export const functions = [syncUserCreation,syncUserDeletion,syncUserUpdation];
import { Inngest } from "inngest";
import User from "../models/user.js";
import connectDB from "../config/db.js";
// import mongoose from "mongoose";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// CREATE
const syncUserCreation = inngest.createFunction(
    {
      id: 'sync-user-from-clerk',
      triggers: [{ event: 'clerk/user.created' }]
    },
    async ({ event }) => {
      try {
        await connectDB();
  
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
  
        const userData = {
          _id: id,
          email: email_addresses?.[0]?.email_address || "",
          name: first_name + ' ' + last_name,
          image: image_url
        };
  
        await User.create(userData).catch(() => {});
        console.log("User created:", id);
  
      } catch (err) {
        console.error("Create Error:", err);
        throw err; //  REQUIRED
      }
    }
  );

// DELETE
const syncUserDeletion = inngest.createFunction(
  {
    id: 'delete-user-from-clerk',
    triggers: [{ event: 'clerk/user.deleted' }]
  },
  async ({ event }) => {
    try {
      await connectDB();

      const { id } = event.data;

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        console.log("User not found");
      }

    } catch (err) {
      console.error("Delete Error:", err);
      throw err;
    }
  }
);

// UPDATE
const syncUserUpdation = inngest.createFunction(
  {
    id: 'update-user-from-clerk',
    triggers: [{ event: 'clerk/user.updated' }]
  },
  async ({ event }) => {
    try {
      await connectDB();

      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address || "",
        name: first_name + ' ' + last_name,
        image: image_url
      };

      await User.findByIdAndUpdate(id, userData, { upsert: true, new: true });
      console.log("User synced:", id);
    } catch (err) {
      console.error("Update Error:", err);
      throw err;
    }
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation
];