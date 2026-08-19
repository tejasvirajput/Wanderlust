const express = require("express");

const router = express.Router();

const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const aiController = require("../controllers/ai.js");

// Current conversation
router.get("/history", isLoggedIn, aiController.getChatHistory);

// Start a new chat
router.post("/new", isLoggedIn, wrapAsync(aiController.saveCurrentChat));

// Get saved conversations
router.get("/saved", isLoggedIn, aiController.getSavedChats);

// Load a saved conversation
router.get("/saved/:id", isLoggedIn, aiController.loadSavedChat);

// Delete a saved conversation
router.delete("/saved/:id", isLoggedIn, aiController.deleteSavedChat);

// Generate listing description
router.post(
  "/generate-listing",
  isLoggedIn,
  wrapAsync(aiController.generateListingDescription),
);

// Chat with Wanderlust AI
router.post("/chat", isLoggedIn, wrapAsync(aiController.chatWithAI));

module.exports = router;
