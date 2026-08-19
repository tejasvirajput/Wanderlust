const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");

const bookingSummary = document.getElementById("booking-summary");
const nightCount = document.getElementById("night-count");
const totalPrice = document.getElementById("total-price");
const pricePerNightElement = document.getElementById("price-per-night");

let checkinPicker;
let checkoutPicker;

let bookedRanges = [];
let bookingsLoaded = false;

// ==========================================
// Load already booked dates
// ==========================================

async function loadBookedDates() {
  try {
    const response = await fetch(`/listings/${listing._id}/bookings`);

    if (!response.ok) {
      throw new Error("Unable to load booked dates.");
    }

    bookedRanges = await response.json();

    bookingsLoaded = true;

    console.log("BOOKED RANGES:", bookedRanges);

    initializeDatePickers();
  } catch (error) {
    console.error("BOOKING DATES ERROR:", error);
  }
}

function getCheckoutLimit() {
  if (!checkin.value) {
    return null;
  }

  const selectedCheckin = new Date(checkin.value);
  selectedCheckin.setHours(0, 0, 0, 0);

  let earliestBookingStart = null;

  bookedRanges.forEach((booking) => {
    const bookedCheckin = new Date(booking.checkIn);
    bookedCheckin.setHours(0, 0, 0, 0);

    // Find the first booking that starts AFTER our check-in
    if (bookedCheckin > selectedCheckin) {
      if (
        earliestBookingStart === null ||
        bookedCheckin < earliestBookingStart
      ) {
        earliestBookingStart = bookedCheckin;
      }
    }
  });

  return earliestBookingStart;
}

// ==========================================
// Initialize Flatpickr
// ==========================================

function initializeDatePickers() {
  // ========================================
  // CHECK-IN CALENDAR
  // ========================================

  checkinPicker = flatpickr(checkin, {
    dateFormat: "Y-m-d",

    altInput: true,
    altFormat: "d-m-Y",

    minDate: "today",

    disable: [
      function (date) {
        return bookedRanges.some((booking) => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);

          checkIn.setHours(0, 0, 0, 0);
          checkOut.setHours(0, 0, 0, 0);

          // Check-in dates are blocked from
          // check-in up to but NOT including checkout.
          return date >= checkIn && date < checkOut;
        });
      },
    ],

    onChange: function (selectedDates, dateStr) {
      if (!dateStr) {
        return;
      }

      // Checkout must be at least 1 day after check-in
      const minimumCheckout = new Date(dateStr);
      minimumCheckout.setDate(minimumCheckout.getDate() + 1);

      checkoutPicker.set("minDate", minimumCheckout);

      // Find the next booking
      const checkoutLimit = getCheckoutLimit();

      if (checkoutLimit) {
        checkoutPicker.set("maxDate", checkoutLimit);
      } else {
        checkoutPicker.set("maxDate", null);
      }

      // Clear previous checkout
      checkoutPicker.clear();

      bookingSummary.style.display = "none";

      checkoutPicker.redraw();
    },
  });

  // ========================================
  // CHECKOUT CALENDAR
  // ========================================

  checkoutPicker = flatpickr(checkout, {
    dateFormat: "Y-m-d",

    altInput: true,
    altFormat: "d-m-Y",

    minDate: "today",

    onChange: function () {
      calculateBooking();
    },
  });
}

// Load bookings first
loadBookedDates();

const pricePerNight = Number(
  pricePerNightElement.textContent.replace(/,/g, ""),
);

// Today's date
const today = new Date().toISOString().split("T")[0];

// Calculate booking
function calculateBooking() {
  if (!checkin.value || !checkout.value) {
    bookingSummary.style.display = "none";
    return;
  }

  const checkinDate = new Date(checkin.value);
  const checkoutDate = new Date(checkout.value);

  const difference = checkoutDate.getTime() - checkinDate.getTime();

  const nights = difference / (1000 * 60 * 60 * 24);

  if (nights <= 0) {
    bookingSummary.style.display = "none";
    return;
  }

  const total = nights * pricePerNight;

  nightCount.textContent = nights;

  totalPrice.textContent = total.toLocaleString("en-IN");

  bookingSummary.style.display = "block";
}

// ================================
// Reserve Button + Razorpay
// ================================

const reserveBtn = document.getElementById("reserve-btn");
const guests = document.getElementById("guests");

if (reserveBtn) {
  reserveBtn.addEventListener("click", async function () {
    // ==========================================
    // Check login
    // ==========================================

    if (!window.currentUser) {
      window.location.href = "/login";
      return;
    }

    // ==========================================
    // Check dates
    // ==========================================

    if (!checkin.value || !checkout.value) {
      showToast(
        "warning",
        "Dates required",
        "Please select your check-in and check-out dates.",
      );
      return;
    }

    // ==========================================
    // Check guests
    // ==========================================

    const guestCount = Number(guests.value);

    if (!guestCount || guestCount < 1) {
      showToast(
        "warning",
        "Guests required",
        "Please select the number of guests.",
      );
      return;
    }

    try {
      reserveBtn.disabled = true;

      reserveBtn.innerHTML = `
        Preparing payment...
        <i class="fa-solid fa-spinner fa-spin"></i>
      `;

      // ==========================================
      // Step 1: Create Razorpay order
      // ==========================================

      const orderResponse = await fetch(
        `/listings/${listing._id}/bookings/create-order`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            checkIn: checkin.value,
            checkOut: checkout.value,
            guests: guestCount,
          }),
        },
      );

      const orderText = await orderResponse.text();

      let orderData;

      try {
        orderData = JSON.parse(orderText);
      } catch (error) {
        throw new Error(
          `Server returned an unexpected response. Status: ${orderResponse.status}`,
        );
      }

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Unable to create payment order.");
      }

      console.log("RAZORPAY ORDER:", orderData);

      // ==========================================
      // Step 2: Open Razorpay Checkout
      // ==========================================

      const options = {
        key: orderData.keyId,

        amount: orderData.amount,

        currency: orderData.currency,

        name: "WanderLust",

        description: "Reservation payment",

        order_id: orderData.orderId,

        handler: async function (paymentResponse) {
          try {
            console.log("RAZORPAY PAYMENT RESPONSE:", paymentResponse);

            // ==========================================
            // Step 3: Verify payment on server
            // ==========================================

            const verifyResponse = await fetch(
              `/listings/${listing._id}/bookings/verify-payment`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,

                  razorpay_payment_id: paymentResponse.razorpay_payment_id,

                  razorpay_signature: paymentResponse.razorpay_signature,

                  checkIn: checkin.value,

                  checkOut: checkout.value,

                  guests: guestCount,
                }),
              },
            );

            const verifyText = await verifyResponse.text();

            let verifyData;

            try {
              verifyData = JSON.parse(verifyText);
            } catch (error) {
              throw new Error(
                `Server returned an unexpected response. Status: ${verifyResponse.status}`,
              );
            }

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            }

            // ==========================================
            // Payment + booking successful
            // ==========================================

            sessionStorage.setItem(
              "wlToast",
              JSON.stringify({
                type: "success",
                title: "Payment successful!",
                message: "Your reservation has been confirmed. 🎉",
              }),
            );

            window.location.href = `/listings/${listing._id}`;
          } catch (error) {
            console.error("PAYMENT VERIFICATION ERROR:", error);

            showToast(
              "error",
              "Payment verification failed",
              error.message || "We couldn't verify your payment.",
            );

            reserveBtn.disabled = false;

            reserveBtn.innerHTML = `
              Reserve your stay
              <i class="fa-solid fa-arrow-right"></i>
            `;
          }
        },

        prefill: {
          name: window.currentUser?.username || "",
          email: window.currentUser?.email || "",
        },

        theme: {
          color: "#fe424d",
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay Checkout closed.");

            reserveBtn.disabled = false;

            reserveBtn.innerHTML = `
              Reserve your stay
              <i class="fa-solid fa-arrow-right"></i>
            `;
          },
        },
      };

      const razorpay = new Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("RAZORPAY PAYMENT FAILED:", response.error);

        showToast(
          "error",
          "Payment failed",
          response.error?.description || "Payment failed. Please try again.",
        );

        reserveBtn.disabled = false;

        reserveBtn.innerHTML = `
            Reserve your stay
            <i class="fa-solid fa-arrow-right"></i>
          `;
      });

      razorpay.open();
    } catch (error) {
      console.error("RAZORPAY ORDER ERROR:", error);

      showToast(
        "error",
        "Payment couldn't start",
        error.message || "Unable to start payment.",
      );

      reserveBtn.disabled = false;

      reserveBtn.innerHTML = `
        Reserve your stay
        <i class="fa-solid fa-arrow-right"></i>
      `;
    }
  });
}
