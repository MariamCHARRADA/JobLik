const asyncHandler = require("express-async-handler");
const City = require("../models/CityModel");
const { constants } = require("../constants");

//@desc Get all cities
//@route GET /api/cities
//@access Public
const getCities = asyncHandler(async (req, res) => {
  try {
    // fetch all documents in the 'City' collection
    const cities = await City.find();
    res.status(200).json(cities);
  } catch (error) {
    error.statusCode = constants.SERVER_ERROR;
    throw error;
  }
});

//@desc Create a new city
//@route POST /api/cities
//@access Public
const createCity = asyncHandler(async (req, res) => {
  try {
    const { Name } = req.body;
    if (!Name) {
      const error = new Error("All fields are mandatory");
      error.statusCode = constants.VALIDATION_ERROR;
      throw error;
    }
    const city = await City.create({
      Name,
    });
    res.status(201).json(city);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = constants.SERVER_ERROR;
    }
    throw error;
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
      const error = new Error("City not found");
      error.statusCode = constants.NOT_FOUND;
      throw error;
    }
    city.Name = Name || city.Name;
    const updatedCity = await city.save();
    res.status(200).json(updatedCity);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = constants.SERVER_ERROR;
    }
    throw error;
  }
});

//@desc Delete a city
//@route DELETE /api/cities/:id
//@access Public
const deleteCity = asyncHandler(async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      const error = new Error("City not found");
      error.statusCode = constants.NOT_FOUND;
      throw error;
    }
    await city.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ message: "City removed" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = constants.SERVER_ERROR;
    }
    throw error;
  }
});

module.exports = { getCities, createCity, updateCity, deleteCity };
