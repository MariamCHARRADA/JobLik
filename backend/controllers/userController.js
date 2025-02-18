const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { constants } = require("../constants");

//@desc Get all users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

//@desc Get a single user by ID
//@route GET /api/users/getUser/:id
//@access public
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const error = new Error("User Not Found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }
  res.status(200).json(user);
});

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, city, phone, address } =
    JSON.parse(req.body.data);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !role ||
    !city ||
    !phone ||
    !address
  ) {
    const error = new Error("All fields are mandatory");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  let imageUrl = null;

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    const error = new Error("User already registered!");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  if (!password) {
    const error = new Error("Password is required");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (req.file) {
    imageUrl = req.file.path;
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    city,
    address,
    phone,
    Photo: imageUrl,
  });

  if (!user) {
    const error = new Error("User data is not valid");
    error.statusCode = constants.SERVER_ERROR;
    throw error;
  }

  res.status(201).json({ user: user });
});

//@desc login a user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error("All fields are mandatory!");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({ accessToken, user });
  } else {
    const error = new Error("password not valid");
    error.statusCode = constants.UNAUTHORIZED;
    throw error;
  }
});

//@desc delete a user
//@route DELETE /api/users/deleteUser/:id
//@access private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const error = new Error("User Not Found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }
  await User.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "User removed" });
});

//@desc Update a user
//@route PUT /api/users/updateUser/:id
//@access private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  const { firstName, lastName, phone, email, address } = req.body;

  if (
    email &&
    (await User.findOne({ email: email, _id: { $ne: req.params.id } }))
  ) {
    const error = new Error("Email already in use");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      email: email || user.email,
      address: address || user.address,
    },
    { new: true }
  );

  if (!updatedUser) {
    const error = new Error("Unable to update user");
    error.statusCode = constants.SERVER_ERROR;
    throw error;
  }

  res.status(200).json(updatedUser);
});

const addCommentAndRating = asyncHandler(async (req, res) => {
  const { serviceProviderId } = req.params;
  const { comment, rating } = req.body;
  const clientId = req.user.id;

  if (!comment && !rating) {
    const error = new Error("You must provide either a comment, a rating, or both.");
    error.statusCode = constants.VALIDATION_ERROR;
    throw error;
  }

  const serviceProvider = await User.findById(serviceProviderId);
  if (!serviceProvider || serviceProvider.role !== "serviceProvider") {
    const error = new Error("Service provider not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  const client = await User.findById(clientId);
  if (!client) {
    const error = new Error("Client not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  const newComment = {
    clientId: {
      _id: client._id,
      firstName: client.firstName,
      lastName: client.lastName,
      Photo: client.Photo,
    },
  };
  if (comment) newComment.comment = comment;
  if (rating) newComment.rating = rating;

  serviceProvider.comments.push(newComment);

  // Recalculate average rating if a rating is provided
  if (rating) {
    const totalRatings = serviceProvider.comments.reduce(
      (sum, c) => sum + (c.rating || 0),
      0
    );
    const numberOfRatings = serviceProvider.comments.filter(
      (c) => c.rating
    ).length;
    serviceProvider.averageRating = totalRatings / numberOfRatings;
  }

  await serviceProvider.save();
  res.status(201).json({ message: "Comment and/or rating added successfully" });
});

const getCommentsAndRatings = asyncHandler(async (req, res) => {
  const { serviceProviderId } = req.params;

  const serviceProvider = await User.findById(serviceProviderId).populate({
    path: "comments.clientId",
    select: "firstName lastName Photo",
  });

  if (!serviceProvider || serviceProvider.role !== "serviceProvider") {
    const error = new Error("Service provider not found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  res.status(200).json({
    comments: serviceProvider.comments.map((comment) => ({
      clientId: comment.clientId,
      comment: comment.comment || null,
      rating: comment.rating || null,
      createdAt: comment.createdAt,
    })),
    averageRating: serviceProvider.averageRating || 0,
  });
});

//@desc Get all service providers
//@route GET /api/users/serviceProviders
//@access public
const getServiceProviders = asyncHandler(async (req, res) => {
  const serviceProviders = await User.find({
    role: "serviceProvider",
  }).populate({
    path: "comments.clientId",
    select: "firstName lastName Photo",
  });

  if (!serviceProviders || serviceProviders.length === 0) {
    const error = new Error("No service providers found");
    error.statusCode = constants.NOT_FOUND;
    throw error;
  }

  res.status(200).json(serviceProviders);
});

//@desc Get top-rated service providers
//@route GET /api/users/topRatedServiceProviders
//@access public
const getTopRatedServiceProviders = asyncHandler(async (req, res) => {
  const topRatedServiceProviders = await User.find({
    role: "serviceProvider",
  })
    .sort({ averageRating: -1 })

  if (!topRatedServiceProviders || topRatedServiceProviders.length === 0) {
      const error = new Error("No top-rated service providers found");
      error.statusCode = constants.NOT_FOUND;
      throw error;
  }

  res.status(200).json(topRatedServiceProviders);
});

module.exports = {
  getUser,
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
  updateUser,
  getCommentsAndRatings,
  addCommentAndRating,
  getServiceProviders,
  getTopRatedServiceProviders,
};
