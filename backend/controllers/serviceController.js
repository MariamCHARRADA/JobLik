const asyncHandler = require("express-async-handler");
const Service = require("../models/ServicesModel");
const { constants } = require("../constants");

//@desc Get all services
//@route Get /api/getServices
//@access private
const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find();
  res.status(200).json(services);
});

//@desc create new service
//@route POST /api/createService
//@access private
const createService = asyncHandler(async (req, res) => {
  const { Name } = req.body;
  let imageUrl = null;

  if (!Name) {
    const error = new Error("Service name is required");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  if (req.file) {
    imageUrl = req.file.path;
  }

  const service = await Service.create({
    Name,
    Photo: imageUrl,
  });

  res.status(201).json(service);
});

//@desc update a service
//@route PUT /api/updateService/:id
//@access private
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  const { Name } = req.body;
  let imageUrl = service.Photo;

  if (req.file) {
    imageUrl = req.file.path;
  }

  const updatedService = await Service.findByIdAndUpdate(
    req.params.id,
    {
      Name: Name || service.Name,
      Photo: imageUrl,
    },
    { new: true }
  );

  res.status(200).json(updatedService);
});

//@desc delete service
//@route DELETE /api/services/:id
//@access private
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    const error = new Error("Service Not Found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }
  await Service.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "service removed" });
});

module.exports = { getServices, createService, updateService, deleteService };
