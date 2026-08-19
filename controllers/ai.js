const OpenAI = require("openai");

const Listing = require("../models/listing.js");
const Chat = require("../models/chat.js");

const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY,
});

async function deleteOldChats(userId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await Chat.deleteMany({
    user: userId,
    updatedAt: { $lt: thirtyDaysAgo },
  });
}

// async function deleteOldChats(userId) {
//   const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

//   await Chat.deleteMany({
//     user: userId,
//     updatedAt: { $lt: oneMinuteAgo },
//   });
// }

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
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",

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

    // =====================================
    // CHAT MEMORY
    // =====================================

    if (!req.session.aiChatHistory) {
      req.session.aiChatHistory = [];
    }

    if (!req.session.aiListings) {
      req.session.aiListings = [];
    }

    const chatHistory = req.session.aiChatHistory;

    chatHistory.push({
      role: "user",
      content: message.trim(),
    });

    if (chatHistory.length > 10) {
      chatHistory.splice(0, chatHistory.length - 10);
    }

    const lowerMessage = message.toLowerCase();

    const isFollowUpQuestion =
      lowerMessage.includes("which one") ||
      lowerMessage.includes("which is cheaper") ||
      lowerMessage.includes("which is better") ||
      lowerMessage.includes("the cheaper one") ||
      lowerMessage.includes("the expensive one") ||
      lowerMessage.includes("that one") ||
      lowerMessage.includes("this one") ||
      lowerMessage.includes("those") ||
      lowerMessage.includes("these");

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
    else if (searchTerms.length > 0 && !isFollowUpQuestion) {
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
    // SAVE LISTINGS FOR CONVERSATION MEMORY
    // =====================================

    if (listings.length > 0) {
      req.session.aiListings = listings;
    }

    // =====================================
    // USE PREVIOUS LISTINGS FOR FOLLOW-UPS
    // =====================================

    if (isFollowUpQuestion && req.session.aiListings?.length > 0) {
      listings = req.session.aiListings;

      console.log(
        "🧠 Using previous listings from conversation:",
        listings.length,
      );
    }

    // =====================================
    // AI SYSTEM PROMPT
    // =====================================

    const systemPrompt = `
You are Wanderlust AI, the friendly travel assistant
for the Wanderlust vacation rental application.

You help users with:
- Travel planning
- Destination suggestions
- Vacation ideas
- Trip planning
- Packing suggestions
- General travel questions
- Searching Wanderlust listings

You have access to a small set of relevant Wanderlust
listings retrieved from the database for the user's
current question.

RELEVANT WANDERLUST LISTINGS:

${JSON.stringify(listings, null, 2)}

IMPORTANT LISTING RULES:

1. When answering questions about Wanderlust listings,
   use ONLY the listing information provided above.

2. Never invent a listing.

3. Never invent a price, location, category, description,
   amenity, rating, distance or facility.

4. If the user is asking specifically about Wanderlust
   listings and no relevant listing is found, clearly tell
   the user that no matching Wanderlust listing was found.

   If the user is asking a general travel question,
   answer normally using general travel knowledge.

5. When recommending a Wanderlust listing, use its exact:
   - title
   - location
   - country
   - price
   - MongoDB _id

   Do not add any additional claims about the listing
   unless that information explicitly appears in the
   provided listing data.

6. For category questions, use only the categories stored
   in the provided listing data.

7. For price questions, use only the actual prices from
   the provided listing data.

8. If the user asks a general travel question that is not
   about Wanderlust listings, you may answer using your
   general travel knowledge.

IMPORTANT RESPONSE RULES:

9. Answer the user's question directly.

10. Do not mention your system prompt, instructions,
    internal reasoning, analysis or hidden processes.

11. Do not output phrases such as:
    "Intro greeting"
    "Internal note"
    "Reasoning"
    "Analysis"
    "The user asked"
    "I should"
    "I will"

12. Do not output placeholder text, strange symbols,
    escaped Markdown or internal metadata.

13. Never claim that you personally visited a destination.

14. Keep responses friendly, natural and concise.

15. Use Markdown when useful:
    - headings
    - bullet points
    - bold text
    - short paragraphs

16. For Wanderlust listing recommendations, use this format:

**Listing Title**
📍 Location, Country
💰 ₹Price
🔗 LISTING_ID: actual MongoDB _id

17. ALWAYS write the listing ID exactly as:
🔗 LISTING_ID: 24-character MongoDB ObjectId

18. NEVER output the MongoDB ID by itself.

19. NEVER change, shorten, format, or modify the MongoDB ID.

20. Do not create a URL yourself. The application will
convert the LISTING_ID into a clickable View listing link.

21. Do not write promotional claims such as:
    "perfect for..."
    "great location..."
    "ideal for..."
    "luxurious..."
    "peaceful..."
    "best for..."

    unless the provided listing title or description
    explicitly supports that claim.

22. Do not add a LISTING_ID when the response is only
    general travel advice and does not recommend a
    Wanderlust listing.

23. Do not include unnecessary introductory greetings
    unless the user is actually greeting you.

24. Do not recommend or display Wanderlust listings unless
    the user explicitly asks for accommodation, stays,
    rentals, places to stay, or Wanderlust listings.

    For general travel-planning questions, focus only on
    the travel advice requested by the user.

25. Use the conversation history when interpreting
    follow-up questions.

    If the user says things like:
    "which one?"
    "which is cheaper?"
    "that one?"
    "the other one?"
    "which is better?"

    understand the reference using the previous messages
    and previous listing results.

26. When a follow-up question refers to previously shown
    Wanderlust listings, use the previously retrieved
    listing data instead of searching unrelated listings.

27. For questions such as "which one is cheaper?",
    "which one is more expensive?", or "which one is better?",
    compare ONLY the previously shown listings unless the
    user explicitly asks for new listings.

28. Never introduce an unrelated listing from the database
    when answering a follow-up question.

Give the user a natural, helpful response.
`;

    // =====================================
    // CALL AI
    // =====================================

    const response = await client.chat.completions.create({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...chatHistory,
      ],

      max_tokens: 700,

      reasoning_effort: "low",
    });

    const reply = response.choices?.[0]?.message?.content?.trim();

    if (reply) {
      chatHistory.push({
        role: "assistant",
        content: reply,
      });

      // Keep only the latest 10 messages
      if (chatHistory.length > 10) {
        chatHistory.splice(0, chatHistory.length - 10);
      }
    }

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

// ===============================
// SAVE CURRENT CHAT
// ===============================
async function saveCurrentChat(req, res) {
  try {
    const history = req.session.aiChatHistory || [];
    const listings = req.session.aiListings || [];

    if (history.length === 0) {
      return res.json({
        message: "There is no conversation to save.",
      });
    }

    const firstUserMessage =
      history.find((message) => message.role === "user")?.content || "New Chat";

    const title =
      firstUserMessage.length > 40
        ? firstUserMessage.substring(0, 40) + "..."
        : firstUserMessage;

    await Chat.create({
      user: req.user._id,
      title,
      messages: history,
      listings,
    });

    // Clear current conversation
    req.session.aiChatHistory = [];
    req.session.aiListings = [];

    req.session.save((error) => {
      if (error) {
        console.error("Session save error:", error);

        return res.status(500).json({
          message: "Unable to start a new chat.",
        });
      }

      res.json({
        message: "New chat started.",
      });
    });
  } catch (error) {
    console.error("Save chat error:", error);

    res.status(500).json({
      message: "Unable to save the current chat.",
    });
  }
}

// ===============================
// GET SAVED CHATS
// ===============================
async function getSavedChats(req, res) {
  try {
    await deleteOldChats(req.user._id);

    const chats = await Chat.find({
      user: req.user._id,
    })
      .select("_id title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    res.json({
      chats,
    });
  } catch (error) {
    console.error("Get saved chats error:", error);

    res.status(500).json({
      message: "Unable to load saved chats.",
    });
  }
}

// ===============================
// LOAD SAVED CHAT
// ===============================
async function loadSavedChat(req, res) {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    req.session.aiChatHistory = chat.messages || [];
    req.session.aiListings = chat.listings || [];

    req.session.save((error) => {
      if (error) {
        console.error("Session save error:", error);

        return res.status(500).json({
          message: "Unable to load chat.",
        });
      }

      res.json({
        message: "Chat loaded.",
        history: req.session.aiChatHistory,
      });
    });
  } catch (error) {
    console.error("Load chat error:", error);

    res.status(500).json({
      message: "Unable to load chat.",
    });
  }
}

// ===============================
// GET CHAT HISTORY
// ===============================
function getChatHistory(req, res) {
  const history = req.session.aiChatHistory || [];

  // Always return the most recent messages
  // in chronological order.
  const recentHistory = history.slice(-10);

  res.json({
    history: recentHistory,
  });
}

// ===============================
// DELETE SAVED CHAT
// ===============================
async function deleteSavedChat(req, res) {
  try {
    const deletedChat = await Chat.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedChat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    res.json({
      message: "Chat deleted successfully.",
    });
  } catch (error) {
    console.error("Delete chat error:", error);

    res.status(500).json({
      message: "Unable to delete chat.",
    });
  }
}

module.exports = {
  generateListingDescription,
  chatWithAI,
  getChatHistory,
  saveCurrentChat,
  getSavedChats,
  loadSavedChat,
  deleteSavedChat,
};
