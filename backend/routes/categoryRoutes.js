const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const upload = require("../middleware/imageUploadHandler");

const router = express.Router();

router.post("/createCategory", upload.single("image"), createCategory);
router.get("/getCategories", getCategories);
router.get("/getCategory/:id", getCategoryById);
router.put("/updateCategory/:id", updateCategory);
router.delete("/deleteCategory/:id", deleteCategory);

module.exports = router;
