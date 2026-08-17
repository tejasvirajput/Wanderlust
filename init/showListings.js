require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");

async function showListings() {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);

    console.log("Connected to MongoDB\n");

    const listings = await Listing.find({}, "_id title location");

    console.log(`Found ${listings.length} listings.\n`);

    listings.forEach((listing, index) => {
      console.log(`${index + 1}.`);
      console.log("ID:", listing._id.toString());
      console.log("TITLE:", listing.title);
      console.log("LOCATION:", listing.location);
      console.log("-----------------------------");
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

showListings();
