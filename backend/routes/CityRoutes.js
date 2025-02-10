const express = require("express");
const {
  getCities,
  createCity,
  updateCity,
  deleteCity,
} = require("../controllers/cityController");

const router = express.Router();

router.get("/getCities", getCities);
router.post("/createCity", createCity);
router.put("/updateCity/:id", updateCity);
router.delete("/deleteCity/:id", deleteCity);

module.exports = router;
