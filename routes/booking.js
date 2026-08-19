const express = require("express");
const router = express.Router({ mergeParams: true });

const crypto = require("crypto");

const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const razorpay = require("../utils/razorpay.js");

// ==========================================
// Get logged-in user's bookings
// ==========================================

router.get("/my", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    const bookings = await Booking.find({
      guest: req.user._id,
      status: "confirmed",
    })
      .populate("listing")
      .sort({ checkIn: 1 });

    res.render("bookings/index.ejs", { bookings });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Get confirmed bookings for a listing
// ==========================================

router.get("/", async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      listing: req.params.id,
      status: "confirmed",
      checkOut: { $gte: new Date() },
    }).select("checkIn checkOut -_id");

    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Cancel a booking
// ==========================================

router.patch("/:bookingId/cancel", async (req, res, next) => {
  try {
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in to cancel a booking.",
      });
    }

    // Find booking
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    // Only the user who made the booking can cancel it
    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking.",
      });
    }

    // Already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "This booking has already been cancelled.",
      });
    }

    // Cannot cancel after checkout
    if (new Date() >= booking.checkOut) {
      return res.status(400).json({
        message: "This booking can no longer be cancelled.",
      });
    }

    // Cancel booking
    booking.status = "cancelled";

    await booking.save();

    req.flash("success", "Your reservation has been cancelled successfully.");

    res.json({
      success: true,
      message: "Booking cancelled successfully.",
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Create Razorpay payment order
// ==========================================

router.post("/create-order", async (req, res, next) => {
  try {
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in to make a reservation.",
      });
    }

    // Find listing
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found.",
      });
    }

    const { checkIn, checkOut, guests } = req.body;

    // Validate dates
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        message: "Please select check-in and check-out dates.",
      });
    }

    // Validate guests
    if (!guests || Number(guests) < 1) {
      return res.status(400).json({
        message: "Please select at least 1 guest.",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for invalid dates
    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid booking dates.",
      });
    }

    // Check-in cannot be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        message: "Check-in date cannot be in the past.",
      });
    }

    // Check-out must be after check-in
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date.",
      });
    }

    // ==========================================
    // Check for overlapping bookings
    // ==========================================

    const existingBooking = await Booking.findOne({
      listing: listing._id,
      status: "confirmed",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This property is already booked for the selected dates.",
      });
    }

    // ==========================================
    // Calculate nights
    // ==========================================

    const difference = checkOutDate.getTime() - checkInDate.getTime();

    const nights = difference / (1000 * 60 * 60 * 24);

    // ==========================================
    // Calculate total price on SERVER
    // ==========================================

    const totalPrice = nights * listing.price;

    // Razorpay expects amount in paise
    const amountInPaise = Math.round(totalPrice * 100);

    // ==========================================
    // Create Razorpay order
    // ==========================================

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        listingId: listing._id.toString(),
        guestId: req.user._id.toString(),
        checkIn,
        checkOut,
        guests: String(guests),
      },
    });

    console.log("RAZORPAY ORDER CREATED:", order.id);

    res.status(201).json({
      success: true,

      orderId: order.id,

      amount: order.amount,

      currency: order.currency,

      keyId: process.env.RAZORPAY_KEY_ID,

      listingId: listing._id,

      nights,

      totalPrice,
    });
  } catch (err) {
    console.error("RAZORPAY ORDER ERROR:", err);
    next(err);
  }
});

// ==========================================
// Verify Razorpay payment
// ==========================================

// ==========================================
// Verify Razorpay payment
// ==========================================

router.post("/verify-payment", async (req, res, next) => {
  try {
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in.",
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // ==========================================
    // Validate payment response
    // ==========================================

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Incomplete payment information.",
      });
    }

    // ==========================================
    // Verify Razorpay signature
    // ==========================================

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed.",
      });
    }

    // ==========================================
    // Fetch Razorpay order
    // ==========================================

    const order = await razorpay.orders.fetch(razorpay_order_id);

    if (!order) {
      return res.status(404).json({
        message: "Payment order not found.",
      });
    }

    // ==========================================
    // Prevent duplicate payment processing
    // ==========================================

    const existingPayment = await Booking.findOne({
      "payment.orderId": razorpay_order_id,
    });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Payment has already been processed.",
        bookingId: existingPayment._id,
      });
    }

    // ==========================================
    // Make sure order belongs to logged-in user
    // ==========================================

    if (
      !order.notes ||
      !order.notes.guestId ||
      order.notes.guestId !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "This payment does not belong to you.",
      });
    }

    // ==========================================
    // Get booking details from Razorpay order
    // ==========================================

    const listingId = order.notes.listingId;
    const checkIn = order.notes.checkIn;
    const checkOut = order.notes.checkOut;
    const guests = Number(order.notes.guests);

    if (!listingId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        message: "Invalid booking information.",
      });
    }

    // ==========================================
    // Find listing
    // ==========================================

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found.",
      });
    }

    // ==========================================
    // Validate booking dates
    // ==========================================

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid booking dates.",
      });
    }

    // Check-in cannot be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        message: "Check-in date cannot be in the past.",
      });
    }

    // Check-out must be after check-in
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date.",
      });
    }

    // ==========================================
    // Check availability AGAIN
    // ==========================================

    const existingBooking = await Booking.findOne({
      listing: listing._id,
      status: "confirmed",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (existingBooking) {
      return res.status(409).json({
        message:
          "These dates were booked while your payment was being processed.",
      });
    }

    // ==========================================
    // Calculate booking details SERVER-SIDE
    // ==========================================

    const difference = checkOutDate.getTime() - checkInDate.getTime();

    const nights = difference / (1000 * 60 * 60 * 24);

    const totalPrice = nights * listing.price;

    // ==========================================
    // Verify paid amount
    // ==========================================

    const expectedAmount = Math.round(totalPrice * 100);

    if (Number(order.amount) !== expectedAmount) {
      return res.status(400).json({
        message: "Payment amount does not match booking amount.",
      });
    }

    // ==========================================
    // Create confirmed booking
    // ==========================================

    const expiresAt = new Date(checkOutDate);

    expiresAt.setDate(expiresAt.getDate() + 2);

    const booking = new Booking({
      listing: listing._id,
      guest: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      nights,
      totalPrice,
      expiresAt,
      status: "confirmed",

      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "paid",
      },
    });

    await booking.save();

    // ==========================================
    // Success
    // ==========================================

    res.status(200).json({
      success: true,
      message: "Payment verified and reservation confirmed.",
      bookingId: booking._id,
    });
  } catch (err) {
    console.error("PAYMENT VERIFICATION ERROR:", err);

    next(err);
  }
});

// ==========================================
// Create a booking
// ==========================================

// router.post("/", async (req, res, next) => {
//   try {
//     // User must be logged in
//     if (!req.user) {
//       return res.status(401).json({
//         message: "You must be logged in to make a reservation.",
//       });
//     }

//     // Find listing
//     const listing = await Listing.findById(req.params.id);

//     if (!listing) {
//       return res.status(404).json({
//         message: "Listing not found.",
//       });
//     }

//     const { checkIn, checkOut, guests } = req.body;

//     // Validate dates
//     if (!checkIn || !checkOut) {
//       return res.status(400).json({
//         message: "Please select check-in and check-out dates.",
//       });
//     }

//     // Validate guests
//     if (!guests || Number(guests) < 1) {
//       return res.status(400).json({
//         message: "Please select at least 1 guest.",
//       });
//     }

//     const checkInDate = new Date(checkIn);
//     const checkOutDate = new Date(checkOut);

//     // Check-in cannot be in the past
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (checkInDate < today) {
//       return res.status(400).json({
//         message: "Check-in date cannot be in the past.",
//       });
//     }

//     // Check-out must be after check-in
//     if (checkOutDate <= checkInDate) {
//       return res.status(400).json({
//         message: "Check-out date must be after check-in date.",
//       });
//     }

//     // ==========================================
//     // Check for overlapping bookings
//     // ==========================================

//     const existingBooking = await Booking.findOne({
//       listing: listing._id,
//       status: "confirmed",
//       checkIn: { $lt: checkOutDate },
//       checkOut: { $gt: checkInDate },
//     });

//     if (existingBooking) {
//       return res.status(409).json({
//         message: "This property is already booked for the selected dates.",
//       });
//     }

//     // ==========================================
//     // Calculate number of nights
//     // ==========================================

//     const difference = checkOutDate.getTime() - checkInDate.getTime();

//     const nights = difference / (1000 * 60 * 60 * 24);

//     // Calculate total price
//     const totalPrice = nights * listing.price;

//     // ==========================================
//     // Delete booking 2 days after checkout
//     // ==========================================

//     const expiresAt = new Date(checkOutDate);

//     expiresAt.setDate(expiresAt.getDate() + 2);

//     // ==========================================
//     // Create booking
//     // ==========================================

//     const booking = new Booking({
//       listing: listing._id,
//       guest: req.user._id,
//       checkIn: checkInDate,
//       checkOut: checkOutDate,
//       guests: Number(guests),
//       nights,
//       totalPrice,
//       expiresAt,
//       status: "confirmed",
//     });

//     await booking.save();

//     req.flash(
//       "success",
//       "Reservation confirmed! 🎉 Your stay has been booked successfully.",
//     );

//     res.status(201).json({
//       success: true,
//       message: "Your reservation has been confirmed!",
//     });
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = router;
