const asyncHandler = require("express-async-handler");
const Categories = require("../models/CategoriesModel");
const mongoose = require("mongoose");

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public
const createCategory = asyncHandler(async (req, res) => {
  try {
    const { Name } = req.body;
    let imageUrl = null;

    if (!Name) {
      res.status(400);
      throw new Error("Category name is required");
    }
    let servicesIds = [];
    if (req.body.Services) {
      servicesIds = JSON.parse(req.body.Services);
      console.log(servicesIds);

      if (!Array.isArray(servicesIds)) {
        res.status(400);
        throw new Error("Services must be provided as an array");
      }

      servicesIds.forEach((serviceId) => {
        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
          res.status(400);
          throw new Error("Invalid service ID");
        }
      });
    }
    if (req.file) {
      imageUrl = req.file.path;
    }

    const category = await Categories.create({
      Name,
      Photo: imageUrl,
      Services: servicesIds,
    });

    if (category) {
      res.status(201).json(category);
    } else {
      res.status(400);
      throw new Error("Invalid category data");
    }
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: error.message });
  }
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

  if (category) {
    res.status(200).json(category);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Public
const updateCategory = asyncHandler(async (req, res) => {
  const { Name, Photo, Services } = req.body;

  const category = await Categories.findById(req.params.id);

  if (category) {
    category.Name = Name || category.Name;
    category.Photo = Photo || category.Photo;
    category.Services = Services || category.Services;

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Public
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }
    await category.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ message: "Category removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
