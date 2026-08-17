const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const aiController = require("../controllers/ai.js");

router.post(
  "/generate-listing",
  isLoggedIn,
  wrapAsync(aiController.generateListingDescription),
);

router.post("/chat", isLoggedIn, wrapAsync(aiController.chatWithAI));

module.exports = router;
