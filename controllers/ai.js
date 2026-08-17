const OpenAI = require("openai");

const Listing = require("../models/listing.js");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ===============================
// AI LISTING DESCRIPTION GENERATOR
// ===============================
async function generateListingDescription(req, res) {
  try {
    const { location, country, price, existingDescription } = req.body || {};

    if (!location) {
      return res.status(400).json({
        message: "Location is required.",
      });
    }

    const prompt = `
You are an AI assistant for Wanderlust, an Airbnb-style
listing application.

Create a catchy listing title and a short, attractive
listing description.

Listing information:
Location: ${location}
Country: ${country || "Not provided"}
Price: ${price || "Not provided"}
Existing description: ${existingDescription || "None"}

Rules:
- Do not invent amenities.
- Do not invent ratings.
- Do not invent distances.
- Do not invent facilities.
- Do not invent views.
- Use only information provided above.
- Keep the title short.
- Keep the description between 50 and 100 words.
- Return exactly this format:

TITLE:
your title here

DESCRIPTION:
your description here
`;

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "openrouter/free",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      max_tokens: 300,
    });

    const text = response.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return res.status(502).json({
        message: "AI returned an empty response.",
      });
    }

    return res.json({
      result: text,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    return res.status(500).json({
      message: "Unable to generate listing content right now.",
    });
  }
}

// ===============================
// WANDERLUST AI CHATBOT
// ===============================
async function chatWithAI(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message.",
      });
    }

    const lowerMessage = message.toLowerCase();

    // =====================================
    // DETECT PRICE / BUDGET
    // =====================================

    let maxBudget = null;

    // Supports:
    // ₹5000
    // ₹5,000
    // 5000
    // 5k
    // ₹5k
    const priceMatch = lowerMessage.match(
      /(?:₹\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand)?/i,
    );

    if (priceMatch) {
      let amount = parseFloat(priceMatch[1].replace(/,/g, ""));

      if (
        priceMatch[2] &&
        (priceMatch[2].toLowerCase() === "k" ||
          priceMatch[2].toLowerCase() === "thousand")
      ) {
        amount *= 1000;
      }

      if (
        lowerMessage.includes("under") ||
        lowerMessage.includes("below") ||
        lowerMessage.includes("less than") ||
        lowerMessage.includes("within") ||
        lowerMessage.includes("budget")
      ) {
        maxBudget = amount;
      }
    }

    console.log("💰 Max budget:", maxBudget || "None");

    // =====================================
    // SEARCH TERMS
    // =====================================

    const searchTerms = lowerMessage
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          ![
            "the",
            "and",
            "for",
            "are",
            "you",
            "have",
            "with",
            "from",
            "what",
            "which",
            "where",
            "show",
            "find",
            "listing",
            "listings",
            "place",
            "places",
          ].includes(word),
      );

    // =====================================
    // DETECT LOCATION
    // =====================================

    const knownLocations = [
      "goa",
      "jaipur",
      "new delhi",
      "delhi",
      "mumbai",
      "pune",
      "bangalore",
      "bangalore urban",
      "dehradun",
      "noida",
      "greater noida",
      "gurugram",
      "calangute",
      "anjuna",
      "siolim",
      "majorda",
    ];

    const matchedLocation = knownLocations.find((location) =>
      lowerMessage.includes(location),
    );

    console.log("📍 Detected location:", matchedLocation || "None");

    // =====================================
    // DETECT CATEGORY
    // =====================================

    const categoryNames = [
      "trending",
      "rooms",
      "iconic-cities",
      "mountains",
      "castles",
      "pools",
      "camping",
      "farms",
      "arctic",
      "domes",
      "boats",
    ];

    const matchedCategory = categoryNames.find((category) =>
      lowerMessage.includes(category),
    );

    console.log("🏷️ Detected category:", matchedCategory || "None");

    // =====================================
    // BUILD COMMON FILTER
    // =====================================

    const listingFilter = {};

    if (matchedLocation) {
      listingFilter.$or = [
        {
          location: new RegExp(matchedLocation, "i"),
        },
        {
          country: new RegExp(matchedLocation, "i"),
        },
        {
          title: new RegExp(matchedLocation, "i"),
        },
      ];
    }

    if (matchedCategory) {
      listingFilter.categories = matchedCategory;
    }

    if (maxBudget !== null) {
      listingFilter.price = {
        $lte: maxBudget,
      };
    }

    // =====================================
    // LISTINGS RESULT
    // =====================================

    let listings = [];

    // =====================================
    // 1. CHEAPEST
    // =====================================

    if (
      lowerMessage.includes("cheapest") ||
      lowerMessage.includes("lowest price") ||
      lowerMessage.includes("least expensive")
    ) {
      listings = await Listing.find(listingFilter)
        .select("_id title description price location country categories")
        .sort({ price: 1 })
        .limit(5)
        .lean();
    }

    // =====================================
    // 2. MOST EXPENSIVE
    // =====================================
    else if (
      lowerMessage.includes("most expensive") ||
      lowerMessage.includes("highest price") ||
      lowerMessage.includes("costliest")
    ) {
      listings = await Listing.find(listingFilter)
        .select("_id title description price location country categories")
        .sort({ price: -1 })
        .limit(5)
        .lean();
    }

    // =====================================
    // 3. CATEGORY / LOCATION SEARCH
    // =====================================
    else if (matchedCategory || matchedLocation || maxBudget !== null) {
      listings = await Listing.find(listingFilter)
        .select("_id title description price location country categories")
        .limit(6)
        .lean();
    }

    // =====================================
    // 4. NORMAL TEXT SEARCH
    // =====================================
    else if (searchTerms.length > 0) {
      const regexes = searchTerms.map((term) => new RegExp(term, "i"));

      listings = await Listing.find({
        $or: [
          { title: { $in: regexes } },
          { description: { $in: regexes } },
          { location: { $in: regexes } },
          { country: { $in: regexes } },
          { categories: { $in: regexes } },
        ],
      })
        .select("_id title description price location country categories")
        .limit(6)
        .lean();
    }

    console.log("📍 Relevant listings found:", listings.length);

    // =====================================
    // AI SYSTEM PROMPT
    // =====================================

    const systemPrompt = `
You are Wanderlust AI, the travel assistant for the
Wanderlust vacation rental application.

You have access to a small set of relevant Wanderlust listings
retrieved from the database for the user's current question.

RELEVANT WANDERLUST LISTINGS:

${JSON.stringify(listings, null, 2)}

IMPORTANT RULES:

1. When answering questions about Wanderlust listings,
   use only the listing information provided above.

2. Never invent a listing.

3. Never invent a price, location, category, description,
   amenity, rating, distance or facility.

4. If the relevant listings do not contain the information
   the user is asking for, clearly say that you could not
   find a matching listing.

5. When recommending a listing, use its actual title,
   location and price.

6. For category questions, use the actual categories
   stored in the database.

7. For price questions, use the actual prices from the
   provided listing data.

8. You can answer general travel questions using general
   knowledge when the question is not about Wanderlust's
   actual listings.

9. Keep responses friendly, concise and easy to read.

10. Use Markdown when useful, including:
    - headings
    - bullet points
    - bold text

11. When recommending a Wanderlust listing, ALWAYS include
    its exact MongoDB listing ID from the provided data.

12. For listing recommendations, use this format:

**Listing Title**
📍 Location
💰 ₹Price
🔗 LISTING_ID: actual MongoDB _id

The user asked:
${message.trim()}
`;

    // =====================================
    // CALL AI
    // =====================================

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "openrouter/free",

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],

      max_tokens: 350,
    });

    const reply = response.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        message: "AI returned an empty response.",
      });
    }

    res.json({
      reply,
    });
  } catch (error) {
    console.error("❌ Chatbot error:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error status:", error.status);
    console.error("❌ Error response:", error.response?.data);

    res.status(500).json({
      message: "Unable to connect to Wanderlust AI right now.",
    });
  }
}

module.exports = {
  generateListingDescription,
  chatWithAI,
};
