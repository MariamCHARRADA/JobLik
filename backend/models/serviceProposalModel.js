const mongoose = require("mongoose");

const serviceProposalSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the service"],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
      required: [true, "Please select a service"],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ref to the user (serviceProvider)
      required: [true, "Provider is required"],
    },
    price: {
      type: Number,
      required: [true, "Please specify a price for the service"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description for the service"],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceProposal", serviceProposalSchema);
