const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // AI routes are API routes
    if (req.originalUrl.startsWith("/ai/")) {
      return res.status(401).json({
        message: "You must be logged in.",
      });
    }

    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You must be logged in to continue.");

    return res.redirect("/login");
  }

  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }

  next();
};

module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    // Listing does not exist
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }

    // Listing has no owner
    if (!listing.owner) {
      req.flash("error", "This listing has no valid owner.");
      return res.redirect("/listings");
    }

    // Current user is not the owner
    if (listing.owner.toString() !== req.user._id.toString()) {
      req.flash("error", "You are not the owner of this listing.");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      req.flash("error", "Review not found.");
      return res.redirect(`/listings/${id}`);
    }

    if (!review.author) {
      req.flash("error", "This review has no valid author.");
      return res.redirect(`/listings/${id}`);
    }

    if (review.author.toString() !== req.user._id.toString()) {
      req.flash("error", "You are not the author of this review.");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    next(err);
  }
};
