const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany();

  const listings = initData.data.map((obj) => {
    const text = `${obj.title} ${obj.description}`.toLowerCase();

    const categories = [];

    // Trending
    if (
      text.includes("luxury") ||
      text.includes("beachfront") ||
      text.includes("paradise") ||
      text.includes("exclusive")
    ) {
      categories.push("trending");
    }

    // Rooms
    if (
      text.includes("apartment") ||
      text.includes("loft") ||
      text.includes("penthouse") ||
      text.includes("room")
    ) {
      categories.push("rooms");
    }

    // Iconic Cities
    const iconicCities = [
      "new york",
      "tokyo",
      "amsterdam",
      "dubai",
      "miami",
      "boston",
      "los angeles",
    ];

    if (iconicCities.some((city) => text.includes(city))) {
      categories.push("iconic-cities");
    }

    // Mountains
    if (
      text.includes("mountain") ||
      text.includes("ski") ||
      text.includes("alps") ||
      text.includes("rockies")
    ) {
      categories.push("mountains");
    }

    // Castles
    if (text.includes("castle") || text.includes("historic villa")) {
      categories.push("castles");
    }

    // Pools
    if (
      text.includes("pool") ||
      text.includes("infinity pool") ||
      text.includes("swimming")
    ) {
      categories.push("pools");
    }

    // Camping / outdoor
    if (
      text.includes("cabin") ||
      text.includes("treehouse") ||
      text.includes("camp")
    ) {
      categories.push("camping");
    }

    // Farms / nature
    if (
      text.includes("farm") ||
      text.includes("nature") ||
      text.includes("eco-friendly")
    ) {
      categories.push("farms");
    }

    // Arctic
    if (
      text.includes("arctic") ||
      text.includes("snow") ||
      text.includes("ski")
    ) {
      categories.push("arctic");
    }

    // Domes
    if (text.includes("dome") || text.includes("igloo")) {
      categories.push("domes");
    }

    // Boats
    if (
      text.includes("boat") ||
      text.includes("yacht") ||
      text.includes("overwater")
    ) {
      categories.push("boats");
    }

    // Make sure every listing has at least one category
    if (categories.length === 0) {
      categories.push("trending");
    }

    return {
      ...obj,

      owner: "68866f94a963abab3a856968",

      categories,

      // Temporary coordinates
      // We will replace these with real Mapbox coordinates
      // in the next step.
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
    };
  });

  await Listing.insertMany(listings);

  console.log(`${listings.length} listings inserted successfully.`);
};

initDB();
