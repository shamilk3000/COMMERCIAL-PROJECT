const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

WalletSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Wallet = mongoose.model("Wallet", WalletSchema);
module.exports = Wallet;
