const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  { timestamps: true }
);

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add your firstName"],
    },
    lastName: {
      type: String,
      required: [true, "Please add your lastName"],
    },
    address: {
      type: String,
      required: [false],
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: [true, "Email already registered"],
    },
    password: {
      type: String,
      required: [true, "Please add password"],
    },
    role: {
      type: String,
      enum: ["client", "serviceProvider"],
      required: [true, "Please add role"],
    },
    city: {
      type: String,
      required: [true, "Please enter your city"],
    },
    phone: {
      type: String,
      required: [true, "Please enter your phoneNumber"],
    },
    Photo: {
      type: String,
    },
    comments: [commentSchema], // Array of comments and ratings
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
userSchema.virtual("showAverageRating").get(function () {
  if (this.role === "serviceProvider") {
    return this.averageRating;
  }
  return undefined;
});

// Ensures that all virtual fields are included automatically
// when converting Mongoose documents to JSON
userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
