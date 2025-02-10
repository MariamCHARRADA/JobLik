const asyncHandler = require("express-async-handler");
const City = require("../models/CityModel");

//@desc Get all cities
//@route GET /api/cities
//@access Public
const getCities = asyncHandler(async (req, res) => {
  try {
    const cities = await City.find();
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//@desc Create a new city
//@route POST /api/cities
//@access Public
const createCity = asyncHandler(async (req, res) => {
  try {
    const { Name } = req.body;
    if (!Name) {
      res.status(400);
      throw new Error("All fields are mandatory");
    }
    const city = await City.create({
      Name,
    });
    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//@desc Update a city
//@route PUT /api/cities/:id
//@access Public
const updateCity = asyncHandler(async (req, res) => {
  try {
    const { Name } = req.body;
    const city = await City.findById(req.params.id);
    if (!city) {
      res.status(404);
      throw new Error("City not found");
    }
    city.Name = Name || city.Name;
    const updatedCity = await city.save();
    res.status(200).json(updatedCity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//@desc Delete a city
//@route DELETE /api/cities/:id
//@access Public
const deleteCity = asyncHandler(async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      res.status(404);
      throw new Error("City not found");
    }
    await city.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ message: "City removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { getCities, createCity, updateCity, deleteCity };
