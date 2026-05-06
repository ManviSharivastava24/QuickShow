import Booking from "../models/Bookings.js";
import Show from "../models/Shows.js";
import stripe from 'stripe';
const checkSeatsAvailability=async(showId,selectedSeats)=>{
    try{
        const showData=await Show.findById(showId)
        if(!showData) return false;
        const occupiedSeats=showData.occupiedSeats;
        const isAnySeatTaken=selectedSeats.some(seat=>occupiedSeats[seat]);
        return !isAnySeatTaken;

    }catch(error){
           console.log(error.message);
           return false;
    }
}
export const createBooking=async(req,res)=>{
    try {
        const {userId}=req.auth();
        const {showId,selectedSeats}=req.body;
        const {origin}=req.headers;
        //check if the seat is available for selected shpw
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
        if(!isAvailable){
            return res.json({success:false,message:"Selected seats are not available."})
        }
        //get show deatils
        const showData=await Show.findById(showId).populate('movie');
        //create a new booking
        const booking=await Booking.create({
            user:userId,
            show:showId,
            amount:showData.showPrice*selectedSeats.length,
            bookedSeats:selectedSeats
        })
        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat]=userId;
        })
        showData.markModified('occupiedSeats');
        await showData.save();
        //Stripe Gateway Initialise
           const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY)
           //creating line item to go for shop
           const line_items=[{
            price_data:{
                currency:'gbp',
                product_data:{
                    name:showData.movie.title
                },
                unit_amount:Math.floor(booking.amount)*100
            },
            quantity:1
           }]
           const session =await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url:`${origin}/my-bookings`,
            line_items:line_items,
            mode:'payment',
            metadata:{
                bookingId:booking._id.toString()
            },
            expires_at:Math.floor(Date.now()/1000)+30*60,
           })
           booking.paymentLink=session.url
           await booking.save()
        res.json({success:true,url:session.url})
    } catch (error) {
        //check if the seat is selected for selected row
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
} 

export const getOccupiedSeats=async(req,res)=>{
    try{
         const {showId}=req.params;
         const showData=await Show.findById(showId)
         if (!showData) {
            return res.json({ success: false, message: "Show not found" });
        }
         const occupiedSeats=Object.keys(showData.occupiedSeats||{})
         res.json({success:true,occupiedSeats})
    }catch(error){
      console.log(error.message);
      res.json({success:false,message:error.message})
    }
}