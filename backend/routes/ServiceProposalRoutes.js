const express = require("express");
const {
  createServiceProposal,
  getServiceProposalsByCategory,
  deleteServiceProposal,
  getServiceProposals,
  getServiceProvidersByCity,
  getLast5ServiceProposals,
  getServiceProposalsByService,
  getServiceProposalsByProvider,
} = require("../controllers/ServiceProposalController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/createProposal", protect, createServiceProposal);
router.get("/getProposals", getServiceProposals);
router.get("/get5Proposals", getLast5ServiceProposals);
router.get("/service/:serviceId", getServiceProposalsByService);
router.get("/provider/:providerId", getServiceProposalsByProvider);
router.get("/category/:categoryId", getServiceProposalsByCategory);
router.get("/service-providers", getServiceProvidersByCity);
router.delete("/:id", protect, deleteServiceProposal);

module.exports = router;
