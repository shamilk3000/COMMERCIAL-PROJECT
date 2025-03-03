const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  addresses: [
    {
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
  ],
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

addressSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
