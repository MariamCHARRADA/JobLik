const asyncHandler = require("express-async-handler");
const Reservation = require("../models/reservationModel");
const User = require("../models/userModel");

//@desc Get all reservations
//@route GET /api/reservations
//@access Private
const getReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate({
      path: "ServiceProposal",
      select: "service price", // Select only service and price from ServiceProposal
      populate: {
        path: "service",
        select: "Name",
      },
    })
    .populate({
      path: "Client",
      select: "email firstName lastName city phone address Photo",
      populate: {
        path: "city", // Populate the city field
        select: "Name", // Select only the name field from the City model
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
  try {
    const { Date, Time, ServiceProposal, ServiceProvider, Client } = req.body;

    // Validate required fields
    if (!Date || !Time || !ServiceProposal || !ServiceProvider || !Client) {
      res.status(400);
      throw new Error("All fields are mandatory");
    }

    // Check if the client is trying to book their own service
    if (Client === ServiceProvider) {
      res.status(400);
      throw new Error("You cannot book your own service.");
    }

    const existingReservation = await Reservation.findOne({
      ServiceProposal: ServiceProposal,
      Time: Time,
      Status: "confirmed",
    });

    console.log("Existing Reservation:", existingReservation);

    if (existingReservation) {
      res.status(400);
      throw new Error("Time slot is already reserved for this service");
    }

    // Create a new reservation
    const reservation = await Reservation.create({
      Date,
      Time,
      ServiceProposal,
      ServiceProvider,
      Client,
    });

    // Send success response
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error in createReservation:", error);

    // Send error response
    res.status(500).json({
      message: "An error occurred while creating the reservation",
      error: error.message,
    });
  }
});

//@desc Delete a reservation
//@route DELETE /api/reservations/:id
//@access Private
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }


  await reservation.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: "Reservation removed" });
});

//@desc Get availability for a service provider
//@route GET /api/reservations/:serviceProviderId/availability
//@access Private
const getAvailabilityForServiceProvider = asyncHandler(async (req, res) => {
  const { ServiceProvider } = req.params; // Use `ServiceProvider` instead of `serviceProviderId`
  const { date } = req.query;
  console.log(ServiceProvider, "test");
  try {
    const serviceProvider = await User.findById(ServiceProvider);
    if (!serviceProvider) {
      return res.status(404).json({ message: "Service provider not found" });
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
  } catch (error) {
    console.error("Error fetching availability:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching availability" });
  }
});

//@desc Update reservation status
//@route PUT /api/reservations/:reservationId/status
//@access Private
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const { status } = req.body;

  if (!["confirmed", "rejected"].includes(status)) {
    res.status(400);
    throw new Error(
      "Invalid status. Status must be 'confirmed' or 'rejected'."
    );
  }

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  if (reservation.ServiceProvider.toString() !== req.user.id) {
    res.status(403);
    throw new Error("You are not authorized to update this reservation status");
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
    })
      

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
