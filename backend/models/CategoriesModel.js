const mongoose = require("mongoose");

const CategoriesSchema = mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Please add category name"],
  },

  Services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
      required: [true, "Please add services"],
    },
  ],
  Photo: {
    type: String,
  },
});

module.exports = mongoose.model("Categories", CategoriesSchema);
