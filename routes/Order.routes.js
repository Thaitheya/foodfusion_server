const express = require("express");
const router = express.Router();
const handler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const auth = require("../src/middleware/Auth.mid");
const { OrderModel } = require("../src/models/Order.model");
const { UserModel } = require("../src/models/user.model");
const { OrderStatus } = require("../src/constants/OrderStatus");
const razorpay = require("../src/config/razorpay.config");
const {
  BAD_REQUEST,
  SUCCESS,
} = require("../src/constants/httpStatus");
require("dotenv").config();
router.use(auth);

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

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      const order = await OrderModel.findOneAndUpdate(
        { razorpay_order_id },
        { razorpay_payment_id, razorpay_signature, status: OrderStatus.PAYED },
        { new: true }
      );
      console.log("Order ID:", razorpay_order_id);
      console.log("Payment ID:", razorpay_payment_id);
      console.log("Signature Received:", razorpay_signature);
      console.log("Expected Signature:", expectedSignature);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.status(200).json({ message: "Payment verified successfully", order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update payment status" });
    }
  } else {
    res.status(400).json({ error: "Invalid payment signature" });
  }
});

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

router.get("/api/orders/newOrderForCurrentUser", auth, async (req, res) => {
  try {
    const order = await OrderModel.findOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    }).sort({ createdAt: -1 });
    if (!order)
      return res.status(404).json({ message: "No new orders found." });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order.", error });
  }
});


router.get(
  "/:status?",
  handler(async (req, res) => {
    const status = req.params.status;
    const user = await UserModel.findById(req.user.id);
    const filter = {};
    if (!user.isAdmin) {
      filter.user = user._id;
    }
    if (status) filter.status = status;

    const orders = await OrderModel.find(filter).sort("-createdAt");
    res.send(orders);
  })
);

router.get("/allstatus", (req, res) => {
  const allStatus = Object.values(OrderStatus);
  res.send(allStatus);
});
const getNewOrderForCurrentUser = async (req) => {
  return await OrderModel.findOne({
    user: req.user.id,
    status: OrderStatus.NEW,
  });
};

module.exports = router;
