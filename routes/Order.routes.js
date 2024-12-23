const express = require("express");
const handler = require("express-async-handler");
// const auth = require("../src/middleware/Auth.mid");
const {
  BAD_REQUEST,
  SUCCESS,
  INTERNAL_SERVER_ERROR,
} = require("../src/constants/httpStatus");
const { OrderModel } = require("../src/models/Order.model");
const { OrderStatus } = require("../src/constants/OrderStatus");
const Razorpay = require("razorpay");

const router = express.Router();
// router.use(auth);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
router.post("/create", async (req, res) => {
  try {
    const { name, address, user, items } = req.body;

    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = new OrderModel({
      name,
      address,
      user,
      items,
      totalPrice,
    });

    await order.save();
    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});


const getNewOrderForCurrentUser = async (req) => {
  try {
    const query = {
      user: req.user.id,
      status: OrderStatus.NEW,
    };
    console.log("Executing Query:", query);

    const order = await OrderModel.findOne(query);
    console.log("Order Retrieved:", order);
    return order;
  } catch (error) {
    console.error("Error in getNewOrderForCurrentUser:", error);
    throw error;
  }
};

router.get(
  "/newOrderForCurrentUser",
  handler(async (req, res) => {
    try {
      const order = await OrderModel.findOne({
        user: req.user.id,
        status: OrderStatus.NEW,
      });
      if (order) {
        res.json(order);
      } else {
        res.status(404).send("No current order found.");
      }
    } catch (error) {
      console.error("Error fetching current order:", error);
      res.status(500).send("Failed to retrieve order.");
    }
  })
);



// Create Payment Order
router.post("/create-payment", async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const paymentOptions = {
      amount: order.totalPrice * 100, // Convert to smallest currency unit (paise)
      currency: "INR",
      receipt: orderId,
    };

    const paymentOrder = await razorpay.orders.create(paymentOptions);

    res.json({ success: true, paymentOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// Verify Payment
router.post("/verify-payment", async (req, res) => {
  const { paymentId, orderId, signature } = req.body;

  try {
    const isValid = razorpay.utils.validateWebhookSignature(
      `${orderId}|${paymentId}`,
      signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { paymentId, status: "PAID" },
      { new: true }
    );

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});
module.exports = router;
