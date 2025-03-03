const mongoose = require("mongoose");
require("dotenv").config();
const env = process.env;



const mongoUrl = env.mongoUrlenv;
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));