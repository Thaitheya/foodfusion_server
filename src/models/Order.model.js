const { model, Schema } = require("mongoose");
const { OrderStatus } = require("../constants/OrderStatus");
const { FoodModel } = require("../models/food.model");

// Schema for individual items in the order
const OrderItemSchema = new Schema(
  {
    food: { type: FoodModel.schema, required: true }, // Embed food schema
    price: { type: Number, required: true }, // Price of the item
    quantity: { type: Number, required: true }, // Quantity of the item
  },
  { _id: false }
);

// Automatically calculate item price before saving
OrderItemSchema.pre("validate", function (next) {
  this.price = this.food.price * this.quantity;
  next();
});

// Schema for the entire order
const orderSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    paymentId: { type: String },
    totalPrice: { type: Number, required: true },
    razorpay_order_id: {type: String},
    razorpay_payment_id: {type:String},
    razorpay_signature: {type: String},
    items: { type: [OrderItemSchema], required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.NEW,
    },
    user: {
      type: Schema.Types.ObjectId, // Reference to the user
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Calculate total price before saving the order
orderSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price, 0);
  next();
});

// Virtual field for formatted total price (e.g., in USD)
orderSchema.virtual("formattedTotalPrice").get(function () {
  return `$${this.totalPrice.toFixed(2)}`;
});

// Export the model
const OrderModel = model("Order", orderSchema);

module.exports = { OrderModel };
