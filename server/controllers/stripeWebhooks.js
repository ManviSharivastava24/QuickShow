// import stripe from "stripe";
// import Booking from "../models/Bookings.js";
// export const stripeWebhooks=async (request,response)=>{
//     const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY);
//     const sig=request.headers["stripe-signature"];
//     let event;
//     try {
//         event=stripeInstance.webhooks.constructEvent(request.body,sig,process.env.STRIPE_WEBHOOK_SECRET)
//     } catch (error) {
//         return response.status(400).send(`Webhook Error:${error.message}`);
//     }
//     try {
//         // switch(event.type){
//         //     case "payment_intent.succeeded":{
//         //         const paymentIntent=event.data.object;
//         //         const sessionList=await stripeInstance.checkout.sessions.list({
//         //             payment_intent:paymentIntent.id
//         //         })
//         //         const session=sessionList.data[0];
//         //         const {bookingId}=session.metadata;
//         //         await Booking.findByIdAndUpdate(bookingId,{
//         //             isPaid:true,
//         //             paymentLink:""
//         //         })
//         //         break;
//         //     }
//         switch (event.type) {
//             case "checkout.session.completed": {
//               const session = event.data.object;
//               const bookingId = session.metadata.bookingId;
          
//               await Booking.findByIdAndUpdate(bookingId,{
//                 isPaid:true,
//                 paymentLink:""
//               });
          
//               console.log("Booking updated");
//               break;
//             }
          
          
//             //now apart form above case if any other event other than succed else happens then this default case will happen


//             default:
//             console.log('Unhandled event type:',event.type)

//         }
//         response.json({received:true})
//     } catch (error) {
//         console.log("Webhook processing error",error);
//         response.status(500).send("Internal Server Error");
//     }
// }
import Stripe from "stripe";
import Booking from "../models/Bookings.js";

export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Webhook reached");
    console.log("Event type:", event.type);

  } catch (err) {
    console.log("❌ Signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("Session:", session.id);
      console.log("Metadata:", session.metadata);

      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.log("❌ bookingId missing");
        return res.json({ received: true });
      }

      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        {
          isPaid: true,
          paymentLink: ""
        },
        { new: true }
      );

      console.log("Updated booking:", updated);
    }

    res.json({ received: true });

  } catch (err) {
    console.log("❌ DB error:", err);
    res.status(500).send("Internal Server Error");
  }
};