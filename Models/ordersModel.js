const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  order_id: { 
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      productImage: [
        {
          data: Buffer,
          contentType: String,
        },
      ],
      size: String,
      selectedColor: String,
      quantity: Number,
      price: Number,
      priceTotal: Number,
      offerPrice: Number,
      totalPrice: Number,
    },
  ],
  couponCode: {
    type: String,
  },
  couponDiscount: {
    type: Number,
  },
  discountAmount: {
    type: Number,
    default: 0,
    required: true,
  },
  totalAmountNoOffer: {
    type: Number,
    default: 0,
    required: true,
  },
  totalAmount: {
    type: Number,
    default: 0,
    required: true,
  },
  address: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    pincode: { type: String, required: true },
    address: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "delivered", "cancelled", "returned",],
    default: "pending",
  },
  deliveryStatus: {
    orderPlaced: { type: Boolean, required: true, default: true },
    orderedDate: { type: Date, required: true, default: Date.now() },
    shipped: { type: Boolean, default: false },
    shippedDate: { type: Date },
    OutOfDelivery: { type: Boolean, default: false },
    OutOfDeliveryDate: { type: Date },
    delivered: { type: Boolean, default: false },
    deliveredDate: { type: Date },
    cancelled: { type: Boolean, default: false },
    cancelledDate: { type: Date },
    return: { type: Boolean, default: false },
    returnDate: { type: Date },
  },
  paymentId: {
    method: { type: String, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "payments" },
  },
  couponDiscount: {
    type: Number,
  },
  deliveryCharge: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
