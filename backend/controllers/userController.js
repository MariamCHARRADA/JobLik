const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Get all users
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, city, phone, address } =
      JSON.parse(req.body.data);

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !role ||
      !city ||
      !phone
    ) {
      res.status(400);
      throw new Error("All fields are mandatory");
    }

    let imageUrl = null;
    console.log("req.body.data", req.body.data);

    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      res.status(400);
      throw new Error("User already registered!");
    }

    if (!password) {
      res.status(400);
      throw new Error("Password is required");
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

    if (user) {
      res.status(201).json({ user: user });
    } else {
      res.status(400);
      throw new Error("User data is not valid");
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: error.message });
  }
});

//@desc login a user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
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
    res.status(401);
    throw new Error("password not valid");
  }
  res.json({ message: "login user" });
});

//@desc delete a user
//@route DELETE /api/users/deleteUser/:id
//@access private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
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
    res.status(404);
    throw new Error("User not found");
  }

  const { firstName, lastName, phone, email, address } = req.body;

  // Check if the email is already in use by another user
  if (
    email &&
    (await User.findOne({ email: email, _id: { $ne: req.params.id } }))
  ) {
    res.status(400);
    throw new Error("Email already in use");
  }

  // Update user fields
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

  if (updatedUser) {
    res.status(200).json(updatedUser);
  } else {
    res.status(400);
    throw new Error("Unable to update user");
  }
});

const addCommentAndRating = asyncHandler(async (req, res) => {
  const { serviceProviderId } = req.params;
  const { comment, rating } = req.body;
  const clientId = req.user.id;

  if (!comment && !rating) {
    res.status(400);
    throw new Error("You must provide either a comment, a rating, or both.");
  }

  const serviceProvider = await User.findById(serviceProviderId);
  if (!serviceProvider || serviceProvider.role !== "serviceProvider") {
    res.status(404);
    throw new Error("Service provider not found");
  }

  // Fetch the client details
  const client = await User.findById(clientId);
  if (!client) {
    res.status(404);
    throw new Error("Client not found");
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
  try {
    const { serviceProviderId } = req.params;

    const serviceProvider = await User.findById(serviceProviderId).populate({
      path: "comments.clientId",
      select: "firstName lastName Photo", // Include Photo
    });

    if (!serviceProvider || serviceProvider.role !== "serviceProvider") {
      res.status(404);
      throw new Error("Service provider not found");
    }

    res.status(200).json({
      comments: serviceProvider.comments.map((comment) => ({
        clientId: comment.clientId, // Return the full clientId object
        comment: comment.comment || null,
        rating: comment.rating || null,
        createdAt: comment.createdAt,
      })),
      averageRating: serviceProvider.averageRating || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//@desc Get all service providers
//@route GET /api/users/serviceProviders
//@access public
const getServiceProviders = asyncHandler(async (req, res) => {
  try {
    const serviceProviders = await User.find({
      role: "serviceProvider",
    }).populate({
      path: "comments.clientId",
      select: "firstName lastName Photo", // Include Photo
    });

    if (!serviceProviders || serviceProviders.length === 0) {
      res.status(404);
      throw new Error("No service providers found");
    }

    res.status(200).json(serviceProviders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//@desc Get top-rated service providers
//@route GET /api/users/topRatedServiceProviders
//@access public
const getTopRatedServiceProviders = asyncHandler(async (req, res) => {
  try {
    const topRatedServiceProviders = await User.find({
      role: "serviceProvider",
    })
      .sort({ averageRating: -1 })
      .limit(5);
    if (!topRatedServiceProviders || topRatedServiceProviders.length === 0) {
      res.status(404);
      throw new Error("No top-rated service providers found");
    }
    res.status(200).json(topRatedServiceProviders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
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
