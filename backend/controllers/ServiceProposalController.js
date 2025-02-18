const asyncHandler = require("express-async-handler");
const ServiceProposal = require("../models/serviceProposalModel");
const Service = require("../models/ServicesModel");
const User = require("../models/userModel");
const Categories = require("../models/CategoriesModel");
const { constants } = require("../constants");

const getServiceProposals = asyncHandler(async (req, res) => {
  const serviceProposals = await ServiceProposal.find()
    .sort({ createdAt: -1 })
    .populate("service")
    .populate("provider");
  res.status(200).json(serviceProposals);
});

const getServiceProposalsByProvider = asyncHandler(async (req, res) => {
  const providerId = req.params.providerId;

  if (!providerId) {
    const error = new Error("Provider ID is required");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const serviceProposals = await ServiceProposal.find({
    provider: providerId,
  })
    .sort({ createdAt: -1 })
    .populate("service")
    .populate("provider");

  if (!serviceProposals.length) {
    const error = new Error("No service proposals found for this provider");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  res.status(200).json(serviceProposals);
});

const getLast5ServiceProposals = asyncHandler(async (req, res) => {
  const serviceProposals = await ServiceProposal.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("service")
    .populate("provider");
  res.status(200).json(serviceProposals);
});

const createServiceProposal = asyncHandler(async (req, res) => {
  const { title, serviceId, price, description } = req.body;
  const userId = req.user.id;

  if (!title || !price || !description) {
    const error = new Error("All fields are required");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const service = await Service.findById(serviceId);

  if (!service) {
    const error = new Error("Service is required");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const user = await User.findById(userId);
  
  if (user.role !== "serviceProvider") {
    const error = new Error("Only service providers can propose services");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const serviceProposal = await ServiceProposal.create({
    service: serviceId,
    provider: userId,
    price,
    title,
    description,
  });

  res.status(201).json(serviceProposal);
});

const getServiceProposalsByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;

  const category = await Categories.findById(categoryId).populate("Services");
  
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  const serviceProposals = await ServiceProposal.find({
    service: { $in: category.Services },
    available: true,
  })
    .sort({ createdAt: -1 })
    .populate("service")
    .populate("provider");

  res.status(200).json(serviceProposals);
});

const getServiceProposalsByService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId) {
    const error = new Error("Service ID is required");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const service = await Service.findById(serviceId);
  
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  const serviceProposals = await ServiceProposal.find({ service: serviceId })
    .sort({ createdAt: -1 })
    .populate({
      path: "service",
      select: "Name",
    })
    .populate("provider");

  res.status(200).json(serviceProposals);
});

const deleteServiceProposal = asyncHandler(async (req, res) => {
  const serviceProposalId = req.params.id;

  const serviceProposal = await ServiceProposal.findById(serviceProposalId);
  
  if (!serviceProposal) {
    const error = new Error("Service proposal not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  await serviceProposal.deleteOne();

  res.status(200).json({ message: "Service proposal deleted successfully" });
});

const getServiceProvidersByCity = asyncHandler(async (req, res) => {
  const { city } = req.query;

  if (!city) {
    const error = new Error("City name is required");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const usersInCity = await User.find({ city, role: "serviceProvider" });

  if (!usersInCity.length) {
    const error = new Error("No service providers found in this city");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  const serviceProposals = await ServiceProposal.find({
    provider: { $in: usersInCity.map((user) => user._id) },
  })
   .sort({ createdAt: -1 })
   .populate("provider", "firstName lastName email city")
   .populate("service", "name description");

   res.status(200).json(serviceProposals);
});

module.exports = {
   createServiceProposal,
   getServiceProposalsByCategory,
   deleteServiceProposal,
   getServiceProposals,
   getServiceProvidersByCity,
   getLast5ServiceProposals,
   getServiceProposalsByService,
   getServiceProposalsByProvider,
};
