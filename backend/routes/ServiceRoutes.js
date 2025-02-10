const express = require("express");
const {
  getServices,
  createService,
  deleteService,
  updateService,
} = require("../controllers/serviceController");
const upload = require("../middleware/imageUploadHandler");

const router = express.Router();

router.get("/getServices", getServices);
router.post("/createService", upload.single("image"), createService);
router.put("/updateService/:id", upload.single("image"), updateService);
router.delete("/deleteService/:id", deleteService);

module.exports = router;
