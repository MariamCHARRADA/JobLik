const mongoose = require("mongoose");

const ReservationSchema = mongoose.Schema({
  ServiceProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProposal",
    required: [true, "Please add a service"],
  },
  price: {
    type: String,
    required: false,
  },
  Client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  phone: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  ServiceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Date: {
    type: Date,
    required: [true, "Please add a date"],
  },
  Time: {
    type: String,
    required: [true, "Please add a time"],
    unique: [true, "You already have a reservation at this time"],
  },
  Status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending",
  },
});

ReservationSchema.index({ Service: 1, Time: 1 }, { unique: true });

module.exports = mongoose.model("Reservation", ReservationSchema);
