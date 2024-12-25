const express = require("express");
const router = express.Router();
const handler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto = require('crypto')
const auth = require("../src/middleware/Auth.mid");
const { OrderModel } = require("../src/models/Order.model");
const { OrderStatus } = require("../src/constants/OrderStatus");
const {
  BAD_REQUEST,
  SUCCESS,
  NOT_FOUND,
} = require("../src/constants/httpStatus");
router.use(auth);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
  headers: {
    "Content-Type": "application/json",
  },
});
router.post("/create", auth, async (req, res) => {
  const { name, address, items } = req.body;

  if (!items || items.length <= 0) {
    return res.status(BAD_REQUEST).json({ message: "No items in the order" });
  }

  const order = new OrderModel({
    name,
    address,
    user: req.user.id,
    items,
  });
  order.totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  console.log("Total Price:", order.totalPrice);

  try {
    await order.save();
    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalPrice * 100,
      currency: "INR",
      receipt: order._id.toString(),
    });
    order.razorpay_order_id = razorpayOrder.id;
    await order.save();

    console.log("Razorpay Order Details:", razorpayOrder);
    res.status(SUCCESS).json({
      order_id: razorpayOrder.id,
      amount: order.totalPrice * 100,
      currency: "INR",
      order,
    });
  } catch (error) {
    res.status(BAD_REQUEST).json({ message: "Error creating order", error });
  }
});

router.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // Validate the signature
  const isValid = verifyRazorpaySignature(req.body);

  if (!isValid) {
    return res
      .status(400)
      .send({ message: "Payment signature verification failed." });
  }

  // If the signature is valid, proceed with the order processing
  try {
    const order = await OrderModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: "PAID",
      },
      { new: true }
    );
    res.send({ message: "Payment verified successfully", order });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in processing payment." });
  }
});

const verifyRazorpaySignature = (paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return generatedSignature === razorpay_signature;
};
router.put(
  "/pay",
  handler(async (req, res) => {
    const { paymentId } = req.body;
    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
      res.status(BAD_REQUEST).send("Order not found");
      return;
    }
    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();
    res.send(order._id);
  })
);

router.get(
  "/newOrderForCurrentUser",
  handler(async (req, res) => {
    const order = await getNewOrderForCurrentUser(req);
    if (order) {
      res.status(SUCCESS).send(order);
    } else {
      res.status(NOT_FOUND).send({ message: "No new order found" });
    }
  })
);

const getNewOrderForCurrentUser = async (req) => {
  return await OrderModel.findOne({
    user: req.user.id,
    status: OrderStatus.NEW,
  });
};

module.exports = router;
