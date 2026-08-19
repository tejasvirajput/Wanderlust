const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index And Create Route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing),
  );

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ==========================================
// Owner Dashboard
// ==========================================

router.get(
  "/dashboard",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const Booking = require("../models/booking.js");

    // Find listings owned by current user
    const listings = await require("../models/listing.js").find({
      owner: req.user._id,
    });

    // Find bookings for owner's listings
    const listingIds = listings.map((listing) => listing._id);

    const bookings = await Booking.find({
      listing: { $in: listingIds },
    })
      .populate("listing")
      .populate("guest")
      .sort({ checkIn: 1 });

    res.render("dashboard/index.ejs", {
      listings,
      bookings,
    });
  }),
);

// Show, Update And Delete Route
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;
