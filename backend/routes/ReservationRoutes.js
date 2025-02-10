const express = require("express");
const {
  getReservations,
  createReservation,
  deleteReservation,
  getAvailabilityForServiceProvider,
  getClientReservations,
  getServiceProviderReservations,
  updateReservationStatus,
} = require("../controllers/reservationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getReservations", getReservations);
router.get("/client", protect, getClientReservations);
router.get("/updateStatus", protect, updateReservationStatus);
router.get("/serviceProvider", protect, getServiceProviderReservations);
router.post("/createReservation", createReservation);
router.delete("/deleteReservation/:id", deleteReservation);
router.get("/:ServiceProvider/availability", getAvailabilityForServiceProvider);

module.exports = router;
