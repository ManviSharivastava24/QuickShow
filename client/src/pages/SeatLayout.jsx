import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import { useState } from 'react';
import Loading from '../components/Loading';
import isoTimeFormat from '../lib/isoTimeFormat';
import BlurCir from '../components/BlurCir';
import { assets } from '../assets/assets';
import toast from "react-hot-toast";

import { useAppContext } from '../context/AppContext';
const SeatLayout = () => {
  const groupRows=[["A","B"],["C","D"],["E","F"],["G","H"],["I","J"]]
  const {id,date}=useParams();
  const { axios,user, getToken } = useAppContext();
   const [selectedSeats,setSelectedSeats]=useState([]);
   const [selectedTime,setSelectedTime]=useState(null);
   const [show,setShow]=useState(null);
   const [occupiedSeats,setOccupiedSeats]=useState([])
   const navigate=useNavigate()

   const getShow=async () =>{
    try {
      const {data}=await axios.get(`/api/show/${id}`)
      if(data.success){
        setShow(data)
      }
    } catch (error) {
      console.log(error)
    }
   }

  //  const handleSeatClick =(seatId)=>{
  //   if(!selectedTime){
  //     return toast("please select time first")
  //   }
  //   if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
  //     return toast("you can select only 5 seats");
  //   }
  //   if(occupiedSeats.includes(seatId)){
  //     return toast('This Seat is already booked');
  //   }
  //   setSelectedSeats(prev=>prev.includes(seatId)?prev.filter(seat=>seat!==seatId):[...prev,seatId])
  //  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast.error("Please select time first");
    }
    
    // This is the part that triggers the "already booked" toast
    if (occupiedSeats.includes(seatId)) {
      return toast.error('This seat is already booked');
    }
  
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast.error("You can select only 5 seats");
    }
  
    setSelectedSeats(prev => 
      prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId]
    );
  };
//    const renderSeats =(row,count=9)=>(
//     <div key={row} className='flex gap-2 mt-2'>
//  <div className='flex flex-wrap items-center justify-center gap-2'>
//   {Array.from({length:count},(_,i)=>{
//     const seatId=`${row}${i+1}`;
//     return (
//       <button key={seatId} onClick={()=> handleSeatClick(seatId) } className={`h-8 w-8 rounded border border-primary/60 cursor-pointer 
//       ${selectedSeats.includes(seatId)&& "bg-primary text-white"}
//       ${occupiedSeats.includes(seatId) && "opacity-50"}`}>
//         {seatId}

//       </button>
//     );
//   })}

//  </div>
//     </div>
     
//    )
const renderSeats = (row, count = 9) => (
  <div key={row} className='mt-2'>
    <div className='flex items-center justify-center gap-2 min-w-max'>
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        const isOccupied = occupiedSeats.includes(seatId);

        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            className={`h-8 w-8 rounded border border-primary/60 transition-all
              ${selectedSeats.includes(seatId) ? "bg-primary text-white" : ""}
              ${
                isOccupied
                  ? "opacity-20 cursor-not-allowed bg-gray-500/20"
                  : "cursor-pointer hover:bg-primary/10"
              }
            `}
            disabled={isOccupied}
          >
            {seatId}
          </button>
        );
      })}
    </div>
  </div>
);

  const getOccupiedSeats=async ()=>{
    if (!selectedTime || !selectedTime.showId) return;
    try{
 const {data}=await axios.get(`/api/booking/seats/${selectedTime.showId}`)
 if(data.success){
  setOccupiedSeats(data.occupiedSeats)
 }else{
  toast.error(data.message)
 }
    }catch(error){
     console.log(error)
    }
  }
  const bookTickets=async ()=>{
    try {
      if(!user) return toast.error('Please login to proceed')
        if(!selectedTime||!selectedSeats.length) return toast.error('Please select a time and seats');
      const {data}=await axios.post('/api/booking/create',{showId:selectedTime.showId,selectedSeats},{headers:{Authorization: `Bearer ${await getToken()}`}});
        if(data.success){
          window.location.href=data.url;
        }else{
          toast.error(data.message)
        }
    } catch (error) {
      toast.error(error.message)
    }
  }


   useEffect(()=>{
    getShow()
   },[])

   useEffect(()=>{
    if(selectedTime){
      getOccupiedSeats()
    }
   },[selectedTime])

  return show ? (
    <div className='flex flex-col md:flex-row px-6 md:x-16 lg:px-40 py-30 md:pt-50'>
     <div className='w-full max-w-xs md:w-60 mx-auto md:mx-0 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max'>
        <p className='text-lg font-semibold px-6'>
          Available Timings
        </p>
        <div>
          {show.dateTime?.[date]?.map((item)=>(
            <div
             key={item.time} 
             onClick={()=> {setSelectedTime(item);
              setSelectedSeats([]);
            }}
             className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time ===item.time ? "bg-primary text-white": "hover:bg-primary/20"}`}>
              <ClockIcon className='w-4 h-4'/>
              <p className='text-sm'>
                {isoTimeFormat(item.time)} 
              </p>
              </div>
          ))}
        </div>
      </div>
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
       {/* seat layout */}
       <BlurCir top="-100px" left="-100px"/>
       <BlurCir bottom="0" right="0"/>
       <h1> Select your Seats</h1>
       <img src={assets.screenImage} alt="screen"/>
       <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>
       <div className="mt-10 text-xs text-gray-300 flex justify-center w-full">
  <div className="scale-75 sm:scale-90 md:scale-100 origin-top">

    {/* A + B */}
    <div className="flex justify-center gap-14 mb-10">
      <div>
        {renderSeats("A")}
        {renderSeats("B")}
      </div>
    </div>

    {/* C D | E F */}
    <div className="flex justify-center gap-20 mb-10">
      <div>
        {renderSeats("C")}
        {renderSeats("D")}
      </div>

      <div>
        {renderSeats("E")}
        {renderSeats("F")}
      </div>
    </div>

    {/* G H | I J */}
    <div className="flex justify-center gap-20">
      <div>
        {renderSeats("G")}
        {renderSeats("H")}
      </div>

      <div>
        {renderSeats("I")}
        {renderSeats("J")}
      </div>
    </div>

  </div>
</div>
      <button onClick={bookTickets} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
        Proceed to Checkout
        <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
      </button>
      </div>
    </div>
  ):(
    <Loading/> 
  )
}

export default SeatLayout