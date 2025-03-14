const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "orders",
  },
  paymentId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  payed: {
    type: Boolean,
    default: true,
    required: true,
  },
  oderStatus:{
    type:String,
    default: "Ordered",
    required: true,
  },
  email: {
    type: String,
  },
  contact: {
    type: String,
  },
  onlineMethod: {
    type: String,
  },
  upiID: {
    type: String,
  },
  cardID: {
    type: String,
  },
  cardDetails: {
    type: Object,
  },
  bank: {
    type: String,
  },
  upiTransactionID: {
    type: String,
  },
  bankTransactionID: {
    type: String,
  },
  bank: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
