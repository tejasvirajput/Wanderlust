require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing");

const DB_URL = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(DB_URL);
  console.log("Connected to MongoDB");
}

function getCategories(listing) {
  const text = `
    ${listing.title || ""}
    ${listing.description || ""}
    ${listing.location || ""}
    ${listing.country || ""}
  `.toLowerCase();

  const categories = [];

  // Rooms
  categories.push("rooms");

  // Mountains
  if (
    text.includes("mountain") ||
    text.includes("himalaya") ||
    text.includes("manali") ||
    text.includes("shimla") ||
    text.includes("alps") ||
    text.includes("hill")
  ) {
    categories.push("mountains");
  }

  // Pools
  if (text.includes("pool") || text.includes("swimming")) {
    categories.push("pools");
  }

  // Camping
  if (
    text.includes("camp") ||
    text.includes("tent") ||
    text.includes("cabin")
  ) {
    categories.push("camping");
  }

  // Farms
  if (
    text.includes("farm") ||
    text.includes("ranch") ||
    text.includes("estate")
  ) {
    categories.push("farms");
  }

  // Arctic
  if (
    text.includes("arctic") ||
    text.includes("igloo") ||
    text.includes("ice") ||
    text.includes("snow") ||
    text.includes("lapland")
  ) {
    categories.push("arctic");
  }

  // Domes
  if (text.includes("dome") || text.includes("geodesic")) {
    categories.push("domes");
  }

  // Boats
  if (
    text.includes("boat") ||
    text.includes("yacht") ||
    text.includes("houseboat")
  ) {
    categories.push("boats");
  }

  // Castles
  if (
    text.includes("castle") ||
    text.includes("palace") ||
    text.includes("fort")
  ) {
    categories.push("castles");
  }

  // Iconic cities
  const iconicCities = [
    "new york",
    "paris",
    "london",
    "tokyo",
    "dubai",
    "rome",
    "mumbai",
    "delhi",
    "jaipur",
  ];

  if (iconicCities.some((city) => text.includes(city))) {
    categories.push("iconic-cities");
  }

  // Trending
  if (
    text.includes("luxury") ||
    text.includes("beach") ||
    text.includes("pool") ||
    text.includes("villa")
  ) {
    categories.push("trending");
  }

  return [...new Set(categories)];
}

async function migrate() {
  try {
    const listings = await Listing.find();

    console.log(`Found ${listings.length} listings.`);

    for (const listing of listings) {
      const categories = getCategories(listing);

      await Listing.updateOne({ _id: listing._id }, { $set: { categories } });

      console.log(`${listing.title} -> ${categories.join(", ")}`);
    }

    console.log("Category migration completed.");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

async function run() {
  await main();
  await migrate();
}

run();
