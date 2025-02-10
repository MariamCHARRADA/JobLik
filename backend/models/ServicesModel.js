const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Please add service name"],
  },
  Photo: {
    type: String,
  },
});

module.exports = mongoose.model("Services", ServiceSchema);
