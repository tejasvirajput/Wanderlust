const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { search, category, sort } = req.query;

  let filter = {};

  // 🔎 Search
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");

    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
      { country: searchRegex },
    ];
  }

  // 🏷️ Category
  if (category) {
    filter.categories = category;
  }

  // 📄 Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;

  // 🔀 Sorting
  let sortOption = {};

  if (sort === "price-asc") {
    sortOption.price = 1;
  } else if (sort === "price-desc") {
    sortOption.price = -1;
  } else if (sort === "newest") {
    sortOption._id = -1;
  } else if (sort === "title-asc") {
    sortOption.title = 1;
  }

  const totalListings = await Listing.countDocuments(filter);
  const totalPages = Math.ceil(totalListings / limit);

  const allListings = await Listing.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  res.render("./listings/index.ejs", {
    allListings,
    selectedCategory: category || "",
    searchQuery: search || "",
    currentPage: page,
    totalPages,
    selectedSort: sort || "",
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
