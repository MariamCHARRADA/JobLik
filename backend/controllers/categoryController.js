const asyncHandler = require("express-async-handler");
const Categories = require("../models/CategoriesModel");
const mongoose = require("mongoose");
const { constants } = require("../constants");

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public
const createCategory = asyncHandler(async (req, res) => {
  const { Name } = req.body;
  let imageUrl = null;

  if (!Name) {
    const error = new Error("Category name is required");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  let servicesIds = [];
  if (req.body.Services) {
    servicesIds = JSON.parse(req.body.Services);

    if (!Array.isArray(servicesIds)) {
      const error = new Error("Services must be provided as an array");
      error.statusCode = constants.VALIDATION_ERROR;
      throw error;
    }

    for (const serviceId of servicesIds) {
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        const error = new Error("Invalid service ID");
        error.statusCode = constants.VALIDATION_ERROR;
        throw error;
      }
    }
  }

  if (req.file) {
    imageUrl = req.file.path;
  }

  const category = await Categories.create({
    Name,
    Photo: imageUrl,
    Services: servicesIds,
  });

  res.status(201).json(category);
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Categories.find().populate("Services");
  res.status(200).json(categories);
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Categories.findById(req.params.id).populate(
    "Services"
  );

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  res.status(200).json(category);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Public
const updateCategory = asyncHandler(async (req, res) => {
  const { Name, Photo, Services } = req.body;

  const category = await Categories.findById(req.params.id);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  category.Name = Name || category.Name;
  category.Photo = Photo || category.Photo;
  category.Services = Services || category.Services;

  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Public
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Categories.findById(req.params.id);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  await category.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Category removed" });
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
