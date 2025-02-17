const express = require("express");
const {
  getUser,
  registerUser,
  loginUser,
  getUsers,
  deleteUser,
  updateUser,
  addCommentAndRating,
  getCommentsAndRatings,
  getServiceProviders,
  getTopRatedServiceProviders,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/imageUploadHandler");

const router = express.Router();

router.post("/register", upload.single("image"), registerUser);
router.post("/login", loginUser);
router.get("/userList", getUsers);
router.get("/getUser/:id", getUser);
router.delete("/deleteUser/:id", deleteUser);
router.put("/updateUser/:id", protect, updateUser);
router.get("/:serviceProviderId/profile", getCommentsAndRatings);
router.post("/:serviceProviderId/comments", protect, addCommentAndRating);
router.get("/serviceProviders", getServiceProviders);
router.get("/topRatedServiceProviders", getTopRatedServiceProviders);

module.exports = router;
