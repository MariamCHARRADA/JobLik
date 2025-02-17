const express = require("express");
const {
  getReservations,
  createReservation,
  deleteReservation,
  getAvailabilityForServiceProvider,
  updateReservationStatus,
  getClientReservations,
  getServiceProviderReservations,
  getServiceProviderAsClientReservations, // Add the new function
} = require("../controllers/reservationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getReservations", getReservations);
router.post("/createReservation", createReservation);
router.delete("/:id", protect, deleteReservation);
router.get("/:ServiceProvider/availability", getAvailabilityForServiceProvider);
router.put("/:reservationId/status", protect, updateReservationStatus);
router.get("/client", protect, getClientReservations);
router.delete("/:id", deleteReservation);
router.get("/serviceProvider", protect, getServiceProviderReservations);

module.exports = router;