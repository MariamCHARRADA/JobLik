const asyncHandler = require("express-async-handler");
const ServiceProposal = require("../models/serviceProposalModel");
const Service = require("../models/ServicesModel");
const User = require("../models/userModel");
const Categories = require("../models/CategoriesModel");

const getServiceProposals = asyncHandler(async (req, res) => {
  try {
    const serviceProposals = await ServiceProposal.find()
      .sort({ createdAt: -1 }) // Sort by most recent first
      .populate("service")
      .populate("provider");
    res.status(200).json(serviceProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getServiceProposalsByProvider = asyncHandler(async (req, res) => {
  try {
    const providerId = req.params.providerId;

    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    const serviceProposals = await ServiceProposal.find({
      provider: providerId,
    })
      .sort({ createdAt: -1 })
      .populate("service")
      .populate("provider");

    if (!serviceProposals.length) {
      return res
        .status(404)
        .json({ message: "No service proposals found for this provider" });
    }

    res.status(200).json(serviceProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getLast5ServiceProposals = asyncHandler(async (req, res) => {
  try {
    const serviceProposals = await ServiceProposal.find()
      .sort({ createdAt: -1 })
      .limit(5) // Limit to the last 5 proposals
      .populate("service")
      .populate("provider");
    res.status(200).json(serviceProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const createServiceProposal = asyncHandler(async (req, res) => {
  try {
    const { title, serviceId, price, description } = req.body;
    const userId = req.user.id;
    if (!title || !price || !description) {
      res.status(400);
      throw new Error("all fields are required");
    }
    const service = await Service.findById(serviceId);

    if (!service) {
      res.status(400);
      throw new Error("Service is required");
    }

    const user = await User.findById(userId);
    if (user.role !== "serviceProvider") {
      res.status(400);
      throw new Error("Only service providers can propose services");
    }

    const serviceProposal = await ServiceProposal.create({
      service: serviceId,
      provider: userId,
      price,
      title,
      description,
    });

    res.status(201).json(serviceProposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getServiceProposalsByCategory = asyncHandler(async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const category = await Categories.findById(categoryId).populate("Services");
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    const serviceProposals = await ServiceProposal.find({
      service: { $in: category.Services },
      available: true,
    })
      .sort({ createdAt: -1 })
      .populate("service")
      .populate("provider", "firstName lastName email");

    res.status(200).json(serviceProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getServiceProposalsByService = asyncHandler(async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const serviceProposals = await ServiceProposal.find({ service: serviceId })
      .sort({ createdAt: -1 })
      .populate({
        path: "provider",
        populate: {
          path: "comments.clientId",
        },
      });

    res.status(200).json(serviceProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const deleteServiceProposal = asyncHandler(async (req, res) => {
  try {
    const serviceProposalId = req.params.id;

    const serviceProposal = await ServiceProposal.findById(serviceProposalId);
    if (!serviceProposal) {
      res.status(404);
      throw new Error("Service proposal not found");
    }

    await serviceProposal.deleteOne();

    res.status(200).json({ message: "Service proposal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getServiceProvidersByCity = asyncHandler(async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City name is required" });
    }

    const usersInCity = await User.find({ city, role: "serviceProvider" });

    if (!usersInCity.length) {
      return res
        .status(404)
        .json({ message: "No service providers found in this city" });
    }

    const serviceProposals = await ServiceProposal.find({
      provider: { $in: usersInCity.map((user) => user._id) },
    })
      .sort({ createdAt: -1 })
      .populate("provider", "firstName lastName email city")
      .populate("service", "name description");

    res.status(200).json(serviceProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
