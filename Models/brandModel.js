const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sale: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
