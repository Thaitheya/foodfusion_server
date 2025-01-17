const express = require("express");
const router = express.Router();
const handler = require("express-async-handler");
const auth = require("../src/middleware/Auth.mid");
const { OrderModel } = require("../src/models/Order.model");
const { UserModel } = require("../src/models/user.model");
const { OrderStatus } = require("../src/constants/OrderStatus");
const razorpay = require("../src/config/razorpay.config");
const {
  BAD_REQUEST,
  SUCCESS,
  UNAUTHORIZED,
} = require("../src/constants/httpStatus");
require("dotenv").config();
router.use(auth);

router.post(
  "/create",
  handler(async (req, res) => {
    const { name, address, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).send("Cart is empty!");
    }

    const totalPrice = items.reduce(
      (sum, item) => sum + item.food.price * item.quantity,
      0
    );

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });
    console.log("Deleted previous order");

    // Create a new order
    const newOrder = new OrderModel({
      name,
      address,
      items,
      totalPrice,
      user: req.user.id, 
      status: OrderStatus.NEW,
    });

    await newOrder.save();

    const razorpayOrder = await razorpay.orders.create({
      amount: totalPrice * 100,
      currency: "INR",
      receipt: newOrder._id.toString(),
    });
    newOrder.razorpay_order_id = razorpayOrder.id;
    await newOrder.save();

    res.status(201).json({
      order_id: newOrder.razorpay_order_id,
      amount: totalPrice * 100,
      currency: "INR",
      order: newOrder,
    });
  })
);


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
  '/newOrderForCurrentUser',
  handler(async (req, res) => {
    const order = await getNewOrderForCurrentUser(req);
    if (order) res.send(order);
    // else res.status(BAD_REQUEST).send("No order is pending");
  })
);

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

router.get(
  '/track/:id',
  handler(async (req, res) => {
    const { id: orderId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).send({ message: 'User not authenticated' });
    }

    const filter = { id: orderId };
    if (!user.isAdmin) {
      filter.user = user.id;
    }

    const order = await OrderModel.findOne(filter);

    if (!order) {
      return res
        .status(404)
        .send({ message: 'Order not found or unauthorized access' });
    }

    return res.status(200).send(order);
  })
);


const getNewOrderForCurrentUser = async (req) => {
  console.log("Fetching order for user:", req.user.id);

  const order = await OrderModel.findOne({
    user: req.user.id,
    status: OrderStatus.NEW,
  }).populate('user');

  if (!order) {
    console.log("No NEW order found for user:", req.user.id);
  }
  return order;
};



module.exports = router;