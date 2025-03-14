const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  offer: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  isDeleted: {
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
    required: true,
  },
});

categorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
