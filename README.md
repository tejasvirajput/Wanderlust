# 🏡 WanderLust — AI-Powered Vacation Rental Platform

🔗 **[Live Demo](https://wanderlust-w1u6.onrender.com)** | ❤️ **Made With Love By: Tejasvi Rajput**

---

**WanderLust** is a full-stack Airbnb-inspired vacation rental platform built using the **MERN-style JavaScript ecosystem**, with server-side rendering using **EJS**.

The project allows users to explore vacation listings, search and filter properties, create and manage listings, write reviews, authenticate securely, view locations on maps, and interact with an **AI-powered travel assistant**.

The AI assistant is integrated with the application's actual MongoDB listing data, allowing users to ask natural-language questions such as:

> "Show me Goa listings under ₹10,000"

and receive relevant listings with their actual prices, locations, descriptions, and clickable listing links.

---

## ✨ Demo / Project Highlights

### 🤖 AI Travel Assistant

WanderLust includes an AI chatbot called **WanderLust AI** that can:

- Answer general travel questions
- Suggest trip itineraries
- Recommend destinations
- Search WanderLust listings
- Search listings by location
- Search listings by category
- Find the cheapest listings
- Find the most expensive listings
- Perform natural-language budget searches
- Return actual listing information from MongoDB
- Generate clickable links to individual listings
- Format responses using Markdown
- Display a typing animation while generating responses

Example:

```
User: Show me Goa listings under ₹10,000

WanderLust AI: Goa Listings Under ₹10,000

**Sashay's Nook** - Forest-View Studio with Pool in Goa
📍 Anjuna, India
💰 ₹5,500
🔗 View listing →
```

---

# 🚀 Features

## 👤 Authentication & Authorization

✅ User registration & login with Passport.js
✅ Session-based authentication
✅ Protected routes & owner-based authorization
✅ Users can modify/delete only their own listings

---

## 🏠 Listing Management

✅ Create, edit, delete listings
✅ Upload images via Cloudinary
✅ Add price, location, country, categories
✅ Store all data in MongoDB

---

## ⭐ Reviews & Ratings

✅ Users can add reviews & ratings
✅ View all reviews for listings
✅ Delete their own reviews

---

# 🔎 Search & Discovery

🏷️ **Categories:** Trending, Rooms, Iconic Cities, Mountains, Castles, Pools, Camping, Farms, Arctic, Domes, Boats

💰 **Price Filter:** Toggle to display price with 18% GST

↕️ **Sorting:** By Recommended, Price (Low-High), Price (High-Low), Newest, Title

📄 **Pagination:** Browse listings page by page

🗺️ **Maps:** Integrated with Mapbox for interactive location display

---

# 🤖 AI-Powered Listing Search

The AI chatbot intelligently searches your MongoDB database:

```
User Query → NLP Processing → MongoDB Filter → Relevant Results → AI Response
```

**Example:** Query "Show me Goa listings under ₹10,000"

The app extracts: `Location: Goa` + `Budget: ₹10,000`

Then searches MongoDB with: `{ location: /goa/i, price: { $lte: 10000 } }`

**Benefits:**
✅ Reduces AI prompt size
✅ Prevents database exposure  
✅ More accurate responses
✅ Lower API costs
✅ Real, grounded data

---

# 💬 AI Features

✨ **Markdown Formatting** - Beautiful formatted responses with headings, lists, links
⏳ **Typing Animation** - Real-time typing indicator while AI processes
🔗 **Clickable Links** - Direct links to listings from AI responses
🔒 **Secure Rendering** - DOMPurify prevents malicious HTML/JS injection
🚫 **No Hallucinations** - AI only references real data from MongoDB

---

# 🔐 Security Features

🛡️ **Helmet.js** - Security HTTP headers
🔐 **Rate Limiting** - Prevents AI API abuse (500 char limit per message)
🔑 **Environment Variables** - No hardcoded secrets
✅ **Authentication** - Passport.js session management
🚫 **Authorization** - Users can only modify their own listings
🧹 **DOMPurify** - Sanitizes AI-generated HTML to prevent XSS attacks

---

# 🛠️ Technology Stack

| Layer           | Technologies                                            |
| --------------- | ------------------------------------------------------- |
| 🎨 **Frontend** | HTML5, CSS3, JavaScript, Bootstrap 5, EJS, Font Awesome |
| 🖥️ **Backend**  | Node.js, Express.js                                     |
| 🗄️ **Database** | MongoDB, Mongoose                                       |
| 🔐 **Auth**     | Passport.js, Express Session                            |
| 🖼️ **Images**   | Multer, Cloudinary                                      |
| 🗺️ **Maps**     | Mapbox GL JS                                            |
| 🤖 **AI**       | OpenRouter, OpenAI SDK                                  |
| 🛡️ **Security** | Helmet, Express Rate Limit, DOMPurify, Marked.js        |

---

# 🏗️ Project Architecture

The application follows an MVC-style structure.

```
WanderLust/
├── app.js
├── controllers/
│   ├── listing.js
│   ├── review.js
│   ├── user.js
│   └── ai.js
├── models/
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── routes/
│   ├── listing.js
│   ├── review.js
│   ├── user.js
│   └── ai.js
├── views/
│   ├── layouts/
│   │   └── boilerplate.ejs
│   ├── includes/
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   └── flash.ejs
│   ├── listings/
│   │   ├── index.ejs
│   │   ├── show.ejs
│   │   ├── new.ejs
│   │   └── edit.ejs
│   ├── users/
│   │   ├── login.ejs
│   │   └── signup.ejs
│   └── error.ejs
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── rating.css
│   └── js/
│       ├── script.js
│       ├── chatbot.js
│       ├── ai.js
│       └── map.js
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
├── init/
│   ├── index.js
│   ├── data.js
│   ├── addCategories.js
│   ├── showListings.js
│   └── fixCategories.js
├── cloudConfig.js
├── middleware.js
├── schema.js
├── package.json
├── .env
└── README.md
```

---

# 🔄 Application Flow

## Normal Listing Flow

```
User
  ↓
Express Route
  ↓
Middleware
  ↓
Controller
  ↓
Mongoose
  ↓
MongoDB
  ↓
EJS View
  ↓
Browser
```

## AI Listing Search Flow

```
User
  ↓
Chatbot UI
  ↓
POST /ai/chat
  ↓
Authentication
  ↓
Input validation
  ↓
Location/category/budget detection
  ↓
MongoDB query
  ↓
Relevant listings
  ↓
OpenRouter AI
  ↓
Markdown response
  ↓
DOMPurify
  ↓
Chatbot UI
```

---

# 📦 Installation & Setup

### 1️⃣ Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
npm install
```

### 2️⃣ Environment Variables

Create `.env` file:

```env
NODE_ENV=development
ATLASDB_URL=your_mongodb_atlas_url
SECRET=your_session_secret
OPENROUTER_API_KEY=your_api_key
OPENAI_MODEL=openrouter/free
BASE_URL=http://localhost:8080
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_secret
MAP_TOKEN=your_mapbox_token
```

### 3️⃣ Required Services Setup

| Service           | Setup                                                 |
| ----------------- | ----------------------------------------------------- |
| 🗄️ **MongoDB**    | Create MongoDB Atlas database & get connection string |
| 🖼️ **Cloudinary** | Get Cloud Name, API Key, API Secret                   |
| 🗺️ **Mapbox**     | Create access token                                   |
| 🤖 **OpenRouter** | Get API key                                           |

### 4️⃣ Run Application

```bash
npm start
# or
nodemon app.js
```

Open: `http://localhost:8080`

---

# 🧪 Test the AI Assistant

After logging in, try these prompts:

```
"Suggest me a 3 day trip to Goa"
"Show me listings under ₹10,000 in Goa"
"Which properties have pools?"
"Find the cheapest listing in Mumbai"
```

The AI will search your database and return real, relevant results!

---

# 🧩 Error Handling

✅ Custom `ExpressError` class for consistent error handling
✅ `wrapAsync` wrapper to prevent repetitive try/catch blocks
✅ User-friendly error pages with clear messages

---

# 🎨 UI/UX Features

✅ Horizontal scrollable category bar
✅ Responsive listing grid with image previews
✅ Smart pagination preserving filters
✅ Dynamic sorting (Price, Date, Alphabetical)
✅ Floating AI chatbot with markdown support
✅ Mobile-responsive design (Mobile, Tablet, Desktop)
✅ Typing animation while AI processes requests

---

# 🎯 Key Learnings

**Backend:** Express.js, RESTful APIs, Controllers, Middleware, Sessions
**Database:** MongoDB, Mongoose, Aggregations, Filtering, Pagination
**Frontend:** EJS, JavaScript, Bootstrap, Responsive Design
**AI Integration:** OpenRouter API, Prompt Engineering, Database Grounding
**Security:** Authentication, Authorization, Input Validation, Rate Limiting, Sanitization

---

# 💡 What Makes This Different?

Most projects stop at basic CRUD operations. WanderLust goes further:

**Typical App:** Create → Save → Display

**WanderLust:** Create → Save → Search → AI Analysis → Database Query → Grounded Response → Clickable Result

The AI is **database-grounded** - it doesn't hallucinate! It searches real listings and provides actual results with clickable links to properties.

---

# 👨‍💻 Developer

**Tejasvi Rajput** | B.Tech Student | Full-Stack Web Developer 🚀

This project demonstrates real-world application architecture, authentication, databases, cloud services, APIs, and AI integration.

---

# 🚀 Quick Start (5 Minutes)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY

# 2. Install
npm install

# 3. Create .env with your credentials (see Installation section)

# 4. Run
nodemon app.js

# 5. Open browser
http://localhost:8080
```

🎉 **That's it! WanderLust is ready to explore.**

---

## 📚 Need Help?

- Check the **Installation & Setup** section for detailed setup
- See **Test the AI Assistant** for example prompts
- Read **Project Architecture** to understand the structure

---

## ⭐ Support

If you found this helpful, please star the repository! It helps others discover the project. 🌟

---

## 📄 License

Educational & Portfolio Use
