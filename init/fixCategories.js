require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");

async function fixCategories() {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);

    console.log("Connected to MongoDB");

    const categoryMap = {
      "68d5999a7f06bee837f6fb28": ["rooms", "trending"],
      "68d59a557f06bee837f6fb38": ["rooms", "trending"],
      "68d59baf7f06bee837f6fb50": ["rooms", "pools", "trending"],
      "68d59b537f06bee837f6fb4a": ["rooms", "trending"],
      "68d59c117f06bee837f6fb56": ["rooms", "mountains"],
      "68d59cb67f06bee837f6fb5c": ["rooms"],
      "68d59d287f06bee837f6fb62": ["rooms"],
      "68d59da67f06bee837f6fb68": ["rooms", "iconic-cities"],
      "68d59e367f06bee837f6fb6e": ["rooms", "iconic-cities", "trending"],
      "68d59ea37f06bee837f6fb74": ["rooms", "pools", "trending"],
      "68d59f167f06bee837f6fb7a": ["rooms", "trending"],
      "68d59fb57f06bee837f6fb83": ["rooms", "trending"],
      "68d5a0ee7f06bee837f6fbb4": ["rooms", "trending"],
      "68d5a1867f06bee837f6fbba": ["rooms"],
      "68d5a1f57f06bee837f6fbc0": ["rooms"],
      "6a82b15a5d03edbafa4d9e10": ["rooms"],
    };

    for (const [id, categories] of Object.entries(categoryMap)) {
      const listing = await Listing.findById(id);

      if (!listing) {
        console.log(`NOT FOUND: ${id}`);
        continue;
      }

      await Listing.updateOne(
        { _id: id },
        { $set: { categories: categories } },
      );

      console.log(`${listing.title} -> ${categories.join(", ")}`);
    }

    console.log("\nCategory cleanup completed.");
  } catch (err) {
    console.error("Category cleanup error:", err);
  } finally {
    await mongoose.connection.close();
  }
}

fixCategories();
