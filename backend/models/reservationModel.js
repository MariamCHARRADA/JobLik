const mongoose = require("mongoose");

const ReservationSchema = mongoose.Schema({
  ServiceProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProposal",
    required: [true, "Please add a service"],
  },
  Client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  },
  Status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending",
  },
});

ReservationSchema.index({ Service: 1, Time: 1 }, { unique: true });

module.exports = mongoose.model("Reservation", ReservationSchema);
