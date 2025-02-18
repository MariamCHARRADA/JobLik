const jwt = require("jsonwebtoken"); // library for for creating and verifying JWTs
const User = require("../models/userModel");
const { constants } = require("../constants");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // extract token

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // decoded object

    // fetch user data (exclude password)
    const reqUser = await User.findById(decoded.user.id).select("-password");

    if (!reqUser) {
      const error = new Error("User not found");
      error.statusCode = constants.NOT_FOUND;
      throw error;
    }

    // attach the retrieved user object to the req object = make it accessible
    req.user = reqUser;

    //  passe control to the next middleware function in the stack
    next();
  } else {
    const error = new Error("Not authorized, no token");
    error.statusCode = constants.UNAUTHORIZED;
    throw error;
  }
});

module.exports = { protect };
