const asyncHandler = require("express-async-handler");
const Reservation = require("../models/reservationModel");
const User = require("../models/userModel");
const { constants } = require("../constants");

//@desc Get all reservations
//@route GET /api/reservations
//@access Private
const getReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate({
      path: "ServiceProposal",
      select: "service price",
      populate: {
        path: "service",
        select: "Name",
      },
    })
    .populate({
      path: "Client",
      select: "email firstName lastName city phone address Photo",
      populate: {
        path: "city",
        select: "Name",
      },
    })
    .populate({
      path: "ServiceProvider",
      select: "firstName lastName email Photo",
    });

  res.status(200).json(reservations);
});

//@desc Create a new reservation
//@route POST /api/reservations
//@access Private
const createReservation = asyncHandler(async (req, res) => {
  const { Date, Time, ServiceProposal, ServiceProvider, Client } = req.body;

  if (!Date || !Time || !ServiceProposal || !ServiceProvider || !Client) {
    const error = new Error("All fields are mandatory");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  if (Client === ServiceProvider) {
    const error = new Error("You cannot book your own service.");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const existingReservation = await Reservation.findOne({
    ServiceProposal: ServiceProposal,
    Time: Time,
    Status: "confirmed",
  });

  if (existingReservation) {
    const error = new Error("Time slot is already reserved for this service");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const reservation = await Reservation.create({
    Date,
    Time,
    ServiceProposal,
    ServiceProvider,
    Client,
  });

  res.status(201).json(reservation);
});

//@desc Delete a reservation
//@route DELETE /api/reservations/:id
//@access Private
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  await reservation.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: "Reservation removed" });
});

//@desc Get availability for a service provider
//@route GET /api/reservations/:serviceProviderId/availability
//@access Private
const getAvailabilityForServiceProvider = asyncHandler(async (req, res) => {
  const { ServiceProvider } = req.params;
  const { date } = req.query;

  const serviceProvider = await User.findById(ServiceProvider);
  
  if (!serviceProvider) {
    const error = new Error("Service provider not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  let selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  let nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const reservations = await Reservation.find({
    ServiceProvider: ServiceProvider,
    Date: { $gte: selectedDate, $lt: nextDay },
    Status: "confirmed",
  });

  const openHour = 9;
  const closeHour = 18;

  let slots = [];
  
  for (let hour = openHour; hour < closeHour; hour++) {
    let timeSlot = `${hour < 10 ? "0" + hour : hour}:00`;
    let isAvailable = !reservations.some(
      (reservation) => reservation.Time === timeSlot
    );
    
    slots.push({ time: timeSlot, isAvailable });
  }

  res.json({ slots });
});

//@desc Update reservation status
//@route PUT /api/reservations/:reservationId/status
//@access Private
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const { status } = req.body;

  if (!["confirmed", "rejected"].includes(status)) {
    const error = new Error("Invalid status. Status must be 'confirmed' or 'rejected'.");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  if (reservation.ServiceProvider.toString() !== req.user.id) {
    const error = new Error("You are not authorized to update this reservation status");
    error.statusCode = constants.FORBIDDEN;
    throw error;
  }

  reservation.Status = status;
  
  await reservation.save();

  res.status(200).json({
    message: `Reservation status updated to ${status}`,
    reservation,
  });
});

//@desc Get reservations for a client
//@route GET /api/reservations/client
//@access Private
const getClientReservations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const reservations = await Reservation.find({ Client: userId })
    .populate({
      path: "ServiceProposal",
      select: "service price title",
      populate: {
        path: "service",
        select: "Name",
      },
    })
    .populate({
      path: "Client",
      select: "email firstName lastName city phone address Photo",
      populate: {
        path: "city",
        select: "Name",
      },
    })
    .populate({
      path: "ServiceProvider",
      select: "email firstName lastName city phone address Photo",
      populate: {
        path: "city",
        select: "Name",
      },
    });

   res.status(200).json(reservations);
});

//@desc Get reservations for a service provider
//@route GET /api/reservations/serviceProvider
//@access Private
const getServiceProviderReservations = asyncHandler(async (req, res) => {
   const userId = req.user.id;

   const reservations = await Reservation.find({
     ServiceProvider: userId,
   })
     .populate({
       path: "ServiceProposal",
       select: "service price title",
       populate: {
         path: "service",
         select: "Name",
       },
     })
     .populate({
       path: "Client",
       select: "email firstName lastName city phone address Photo",
       populate: {
         path: "city",
         select: "Name",
       },
     })
     .populate("ServiceProvider", "firstName lastName email Photo");

   res.status(200).json(reservations);
});

module.exports = {
   getReservations,
   createReservation,
   deleteReservation,
   getAvailabilityForServiceProvider,
   updateReservationStatus,
   getClientReservations,
   getServiceProviderReservations,
};
