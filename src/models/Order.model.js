const { model, Schema } = require("mongoose");
const { OrderStatus } = require("../constants/OrderStatus");
const { FoodModel } = require("../models/food.model");

const OrderItemSchema = new Schema({
  food: { type: FoodModel.schema, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

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
    items: { type: [OrderItemSchema], required: true },
    status: { type: String, default: OrderStatus.NEW },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const OrderModel = model("orders", orderSchema);
module.exports = { OrderModel };
