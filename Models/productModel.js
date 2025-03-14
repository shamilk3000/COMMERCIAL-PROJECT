const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  productImage: [
    {
      data: Buffer,
      contentType: String,
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  colors: [
    {
      type: [String, Number],
      required: false,
    },
  ],
  brand: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
    required: true,
  },
  rating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rating",
  },
  offer: {
    type: Number,
    default: 0,
    required: true,
  },
  offerPrice: {
    type: Number,
    required: true,
  },
  categoryOfferPrice: {
    type: Number,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true,
  },
  categoryDeleted: {
    type: Boolean,
    default: false,
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
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
  },
});

productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
