const { model, Schema } = require("mongoose");
const { OrderStatus } = require("../constants/OrderStatus");
const { FoodModel } = require("../models/food.model");

const OrderItemSchema = new Schema(
  {
    food: { type: FoodModel.schema, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

OrderItemSchema.pre("validate", function (next) {
  this.price = this.food.price * this.quantity;
  next();
});

const orderSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    paymentId: { type: String },
    totalPrice: { type: Number, required: true },
    razorpay_order_id: { type: String, unique: true, sparse: true },
    razorpay_payment_id: {type:String},
    items: { type: [OrderItemSchema], required: true },
    status: {
      type: String,
      default: OrderStatus.NEW,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

orderSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price, 0);
  next();
});

orderSchema.virtual("formattedTotalPrice").get(function () {
  return `₹${this.totalPrice.toFixed(2)}`;
});

const OrderModel = model("Order", orderSchema);

module.exports = { OrderModel };
