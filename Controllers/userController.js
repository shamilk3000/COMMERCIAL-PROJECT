const User = require("../Models/userModel");
const Category = require("../Models/categoryModel");
const Product = require("../Models/productModel");
const Review = require("../Models/reviewModel");
const Cart = require("../Models/cartModel");
const Address = require("../Models/addressModel");
const Wishlist = require("../Models/wishlistModel");
const Order = require("../Models/ordersModel");
const Payment = require("../Models/paymentModel");
const Wallet = require("../Models/walletModel");
const Razorpay = require("razorpay");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const saltround = 10;
const moment = require("moment");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
require("dotenv").config();
const otpGenerator = require("otp-generator");
const sendEmail = require("../Configure/otpEmailsender");
const Coupon = require("../Models/couponModel");

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

const sessionCheck = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    const errorMessage = req.query.error;
    const completed = req.query.completed;
    if (errorMessage || completed) {
      res.render("user/user-login", {
        warning: errorMessage,
        completed: completed,
      });
    } else {
      res.render("user/user-login", { warning: req.session.warning });
    }
  }
};

const home = async function (req, res) {
  try {
    let search = req.body || {};
    let filterData = search;

    const category = await Category.find({ isDeleted: false });
    const completed = req.query.completed;

    // Shuffle Function
    const shuffleArray = (array) => {
      return array.sort(() => Math.random() - 0.5);
    };

    // Fetch and process products with ratings
    let productDB = await Product.aggregate([
      {
        $match: { isDeleted: false, categoryDeleted: false },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          rating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0,
            },
          },
        },
      },
      { $project: { reviews: 0 } },
    ]);
    productDB = shuffleArray(productDB);

    if (search.filter) {
      if (search.name?.trim()) {
        productDB = productDB.filter((product) =>
          product.name.toLowerCase().includes(search.name.toLowerCase())
        );
      }
      if (search.size && search.size !== "undefined") {
        productDB = productDB.filter(
          (product) => product.size.toString() === search.size
        );
      }
      if (search.category && search.category !== "undefined") {
        const categoryId = new ObjectId(search.category);
        productDB = productDB.filter((product) =>
          product.category.equals(categoryId)
        );
        let categoryDB = await Category.findById(categoryId);
      }
      if (search.stock && search.stock !== "undefined") {
        productDB = productDB.filter((product) =>
          search.stock === "in" ? product.quantity > 0 : product.quantity <= 0
        );
      }

      if (search.order && search.order !== "undefined") {
        const orderFunctions = {
          "n-az": (a, b) => a.name.localeCompare(b.name),
          "n-za": (a, b) => b.name.localeCompare(a.name),
          "p-hl": (a, b) => b.categoryOfferPrice - a.categoryOfferPrice,
          "p-lh": (a, b) => a.categoryOfferPrice - b.categoryOfferPrice,
          "r-hl": (a, b) => b.rating - a.rating,
          "r-lh": (a, b) => a.rating - b.rating,
          na: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        };
        if (orderFunctions[search.order]) {
          productDB.sort(orderFunctions[search.order]);
        }
      }

      return res.render("user/user-home", {
        filter: true,
        filterData: JSON.stringify(filterData),
        completed,
        filterProducts: productDB,
        category,
      });
    }

    if (search.searchContent) {
      const filteredProducts = productDB.filter((product) =>
        product.name.toLowerCase().includes(search.searchContent.toLowerCase())
      );
      return res.render("user/user-home", {
        search: true,
        resultFor: search.searchContent,
        completed,
        searchProducts: filteredProducts,
        category,
      });
    }

    return res.render("user/user-home", {
      completed,
      products: productDB,
      category,
    });
  } catch (error) {
    console.error("Error loading home page:", error);
    return res.status(500).render("user/user-home", {
      completed: "An error occurred while loading the home page.",
      products: [],
    });
  }
};

const loginSub = async function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  try {
    const enterUser = req.body;
    const user = await User.findOne({ email: enterUser.email, role: "user" });
    let match = "";

    if (user) {
      if (user.isActive) {
        if (user.password) {
          match = await bcrypt.compare(enterUser.password, user.password);
        }
        if (match) {
          req.session.user = enterUser.email;
          return res.redirect("/?completed=Welcome back! Login successful.");
        } else if (user.googleId) {
          return res.redirect(
            "/auth/google?completed=Welcome back! Login successful."
          );
        } else {
          req.session.warning = "Invalid Password";
        }
      } else {
        req.session.warning = "You are Blocked";
      }
    } else {
      req.session.warning = "Invalid email";
    }

    res.render("user/user-login", { warning: req.session.warning });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).render("user/user-login", {
      warning: "An error occurred during login. Please try again later.",
    });
  }
};

const noReturn = function (req, res, next) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    next();
  }
};

const authController = {
  googleAuth: (req, res, next) => {
    if (req.session.user) {
      return res.redirect("/");
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  },

  googleCallback: (req, res, next) => {
    if (req.session.user) {
      return res.redirect("/");
    }
    passport.authenticate("google", {
      failureRedirect: "/sessionCheck?error=Authentication Failed",
    })(req, res, next);
  },

  handleCallback: async (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    }
    try {
      const user = req.user;
      const userDB = await User.findOne({ email: user.email, role: "user" });
      if (!user.isVerified) {
        if (!userDB.isActive) {
          res.redirect("/sessionCheck?error=Your account has been blocked.");
        } else if (userDB.isActive) {
          const date = new Date().toString();
          const otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
          });
          const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

          await User.findOneAndUpdate(
            { email: user.email, role: "user" },
            {
              $set: {
                otp: otp,
                otpExpiresAt: otpExpiresAt,
                updatedAt: date,
              },
            }
          );

          await sendEmail(
            user.email,
            "Your OTP for Verification",
            `Your OTP is: "${otp}" . It will expire in 5 minutes.`
          );

          res.redirect(`/getVerify-otp?email=${user.email}`);
        }
      } else {
        if (user.isActive) {
          req.session.user = user.email;
          res.redirect("/");
        } else {
          res.redirect("/sessionCheck?error=Your account has been blocked.");
        }
      }
    } catch (err) {
      console.error("Error handling Google login:", err);
      await User.findOneAndDelete({ isVerified: false, role: "user" });
      res.redirect("/sessionCheck?error=Something went wrong.Try again");
    }
  },

  verifyOtp: async (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    }
    const { email, otp } = req.body;

    try {
      const date = new Date().toString();
      const user = await User.findOne({ email: email, role: "user" });

      if (!user) {
        await User.findOneAndDelete({ email: email, role: "user" });
        return res.redirect(
          "/sessionCheck?error=Something went wrong.Try again"
        );
      }

      if (user.isActive) {
        if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
          return res.redirect(
            `/getVerify-otp?email=${email}&warning=Invalid or expired OTP`
          );
        }

        await User.findOneAndUpdate(
          { email: user.email, role: "user" },
          {
            $set: {
              isVerified: true,
              updatedAt: date,
            },
            $unset: {
              otp: "",
              otpExpiresAt: "",
            },
          }
        );
        if (user.isActive) {
          req.session.user = user.email;
          res.redirect(
            "/?completed=Your OTP verification was successfully completed.."
          );
        } else {
          res.redirect("/sessionCheck?error=Your account has been blocked.");
        }
      } else {
        res.redirect("/sessionCheck?error=Your account has been blocked.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      await User.findOneAndDelete({ email: email, role: "user" });
      res.redirect("/sessionCheck?error=Something went wrong.Try again");
    }
  },

  resendOtp: async (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    }
    try {
      const { email } = req.body;
      const dateNow = new Date().toString();
      const user = await User.findOne({ email: email, role: "user" });

      if (!user) {
        return res.redirect("/sessionCheck?error=User not found");
      }

      if (user.isVerified) {
        return res.redirect("/sessionCheck?error=User already verified");
      }

      if (!user.isActive) {
        await User.findOneAndUpdate(
          { email: user.email, role: "user" },
          {
            $set: {
              updatedAt: dateNow,
            },
            $unset: {
              otp: "",
              otpExpiresAt: "",
            },
          }
        );
        return res.redirect(
          "/sessionCheck?error=Your account has been blocked."
        );
      }

      const date = new Date().toString();
      const otp = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await User.findOneAndUpdate(
        { email: email, role: "user" },
        {
          $set: {
            otp: otp,
            otpExpiresAt: otpExpiresAt,
            updatedAt: date,
          },
        }
      );

      await sendEmail(
        email,
        "Your New OTP for Verification",
        `Your new OTP is: "${otp}" . It will expire in 5 minutes.`
      );
      const text = ` Your new OTP has been sent to your email address ${email}`;
      res.redirect(`/getVerify-otp?email=${email}&warning=${text}`);
    } catch (err) {
      console.error("Error resending OTP:", err);
      res.redirect("/sessionCheck?error=Something went wrong.Try again");
    }
  },
};

const getVerifyOtp = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  }
  const { email, warning } = req.query;
  if (!email) {
    return res.redirect("/sessionCheck?error=Email is required");
  }
  res.render("user/user-signupOtp", { email, warning });
};

const signUp = function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  res.render("user/user-signup");
};

const backToSign_in = async function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  try {
    const email = req.query.email;

    const user = await User.findOne({ email: email, role: "user" }); // Await added here
    if (user) {
      await User.findOneAndDelete({ email: email, role: "user" });
    }

    res.redirect("/sessionCheck?error=OTP verification has been canceled.");
  } catch (error) {
    console.error("Error in backToSign_in:", error);
    res.redirect(
      "/sessionCheck?error=An error occurred while canceling OTP verification."
    );
  }
};

const signupSub = async (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  }
  try {
    const { username, email, phoneNumber, password, confirmPassword } =
      req.body;
    const existingUser = await User.findOne({ email: email, role: "user" });

    if (existingUser) {
      if (existingUser.googleId) {
        return res.redirect("/auth/google");
      } else {
        return res.render("user/user-signup", {
          warning: "Email is already registered.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      email: email,
      phoneNumber: phoneNumber,
      password: hashedPassword,
      isVerified: false,
      role: "user",
      updatedBy: email,
    });

    await newUser.save();

    const date = new Date().toString();
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await User.findOneAndUpdate(
      { email: email, role: "user" },
      {
        $set: {
          otp: otp,
          otpExpiresAt: otpExpiresAt,
          updatedAt: date,
        },
      }
    );

    await sendEmail(
      email,
      "Your OTP for Verification",
      `Your OTP is: "${otp}" . It will expire in 5 minutes.`
    );

    res.redirect(`/getVerify-otp?email=${email}`);
  } catch (error) {
    console.error("Error in signupSub:", error);
    res.render("user/user-signup", {
      warning: "An error occurred while signing up. Please try again.",
    });
  }
};

const forgotPass = function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  const errorMessage = req.query.error;
  if (errorMessage) {
    res.render("user/user-forgotPassword", { warning: errorMessage });
  } else {
    res.render("user/user-forgotPassword");
  }
};

const forgotPassOtp = async function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email, role: "user" });

    if (!user) {
      return res.redirect("/forgotPass?error=Email is not registered");
    }

    const date = new Date().toString();
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await User.findOneAndUpdate(
      { email: email, role: "user" },
      {
        $set: {
          otp: otp,
          otpExpiresAt: otpExpiresAt,
          updatedAt: date,
        },
      }
    );

    await sendEmail(
      email,
      "Your OTP For Resetting Your Password",
      `Your OTP is: "${otp}" . It will expire in 5 minutes.`
    );

    res.redirect(`/getForgotpassOtp?email=${email}`);
  } catch (error) {
    console.error("Error in forgotPassOtp:", error);
    res.redirect("/forgotPass?error=An error occurred. Please try again.");
  }
};

const getForgotpassOtp = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  }
  const { email, warning } = req.query;
  if (!email) {
    return res.redirect("/forgotPass?error=Email is required");
  }
  res.render("user/user-forgotpassOtp", { email, warning });
};

const forgotPassOtpSub = async function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email: email, role: "user" });

    if (!user) {
      return res.redirect("/forgotPass?error=Email is not registered");
    }

    if (!user.isActive) {
      await User.findOneAndUpdate(
        { email: email, role: "user" },
        { $unset: { otp: "", otpExpiresAt: "" } }
      );
      return res.redirect("/forgotPass?error=Your account has been blocked.");
    }

    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.redirect(
        `/getForgotpassOtp?warning=Invalid or expired OTP&email=${email}`
      );
    }

    await User.findOneAndUpdate(
      { email: user.email, role: "user" },
      { $unset: { otp: "", otpExpiresAt: "" } }
    );

    res.redirect(
      `/restPass?completed=Your OTP verification was successfully completed..&email=${email}`
    );
  } catch (err) {
    console.error("Error verifying OTP:", err);

    await User.findOneAndUpdate(
      { email: email, role: "user" },
      { $unset: { otp: "", otpExpiresAt: "" } }
    );

    res.redirect("/forgotPass?error=Something went wrong. Try again.");
  }
};

const restPass = function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  const email = req.query.email;
  const error = req.query.error;
  const completed = req.query.completed;
  res.render("user/user-restPass", {
    warning: error,
    email: email,
    completed: completed,
  });
};

const restPassSub = async function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  try {
    const { email, password, confirmPassword } = req.body;
    const date = new Date().toString();
    const user = await User.findOne({ email: email, role: "user" });

    if (!user) {
      return res.redirect("/restPass?error=User not found");
    }

    let match = "";
    if (user.password) {
      match = await bcrypt.compare(password, user.password);
    }
    if (match) {
      return res.redirect(
        `/restPass?error=This is your current password. Please enter a new password.&email=${email}`
      );
    } else if (password === confirmPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.findOneAndUpdate(
        { email: email, role: "user" },
        {
          $set: {
            password: hashedPassword,
            updatedBy: email,
            updatedAt: date,
          },
        }
      );
      return res.redirect(
        "/sessionCheck?completed=Your password has been reset."
      );
    } else {
      return res.redirect(
        `/restPass?error=Passwords do not match&email=${email}`
      );
    }
  } catch (err) {
    console.error("Error resetting password:", err);
    res.redirect("/restPass?error=Something went wrong. Try again.");
  }
};

const backTolog = async function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  try {
    const email = req.query.email;
    await User.findOneAndUpdate(
      { email: email, role: "user" },
      {
        $unset: {
          otp: "",
          otpExpiresAt: "",
        },
      }
    );
    res.redirect("/sessionCheck?error=Password reset has been canceled.");
  } catch (err) {
    console.error("Error canceling password reset:", err);
    res.redirect("/sessionCheck?error=Something went wrong. Try again.");
  }
};

const rsntPasOtp = async (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  }
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email, role: "user" });
    if (!user) {
      return res.redirect("/forgotPass?error=Email is not registered");
    }
    if (!user.isActive) {
      return res.redirect("/forgotPass?error=Your account has been blocked.");
    }
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await User.findOneAndUpdate(
      { email: email, role: "user" },
      { $set: { otp: otp, otpExpiresAt: otpExpiresAt, updatedAt: new Date() } }
    );
    await sendEmail(
      email,
      "Your OTP For Resetting Your Password",
      `Your OTP is: "${otp}". It will expire in 5 minutes.`
    );
    res.redirect(
      `/getForgotpassOtp?email=${email}&warning=Your new OTP has been sent to your email address`
    );
  } catch (err) {
    console.error("Error resending OTP:", err);
    res.redirect("/forgotPass?error=Something went wrong. Try again");
  }
};

const productSingle = async function (req, res) {
  try {
    const id = req.query.id;
    const category = await Category.find({ isDeleted: false });
    const product = await Product.findById(id);
    const categoryDB = await Category.findById(product.category);
    let offer = Number(product.offer) + Number(categoryDB.offer);
    if (!product) {
      return res.redirect("/error?message=Product not found");
    }
    const reviews = await Review.find({ productId: new ObjectId(id) });
    const rating = await Review.aggregate([
      { $match: { productId: new ObjectId(id) } },
      { $group: { _id: null, rating: { $avg: "$rating" } } },
    ]);
    rating.forEach(
      (item) => (item.rating = parseFloat(item.rating.toFixed(1)))
    );
    const suggest = await Product.aggregate([
      {
        $match: {
          category: product.category,
          _id: { $ne: new ObjectId(id) },
          isDeleted: false,
          categoryDeleted: false,
        },
      },
      { $sample: { size: 4 } },
    ]);
    res.render("user/user-productSingle", {
      offer,
      product,
      email: req.session.user,
      suggest,
      rating,
      totalReviews: reviews.length,
      reviews3: reviews.slice(0, 3),
      reviews,
      category: category,
    });
  } catch (err) {
    console.error("Error fetching product details:", err);
    res.redirect(
      "/error?message=Something went wrong while fetching the product"
    );
  }
};

const submitReview = async function (req, res) {
  try {
    const { email, rating, review } = req.body;
    const id = req.query.productId;
    const user = await User.findOne({ email: email, role: "user" });
    if (!user) {
      return res.redirect(`/productSingle?id=${id}&error=User not found`);
    }
    const reviewData = new Review({
      userId: user._id,
      username: user.username,
      productId: new ObjectId(id),
      rating,
      review,
    });
    await reviewData.save();
    res.redirect(`/productSingle?id=${id}`);
  } catch (err) {
    console.error("Error submitting review:", err);
    res.redirect(
      `/productSingle?id=${req.query.productId}&error=Failed to submit review`
    );
  }
};

const shop = async function (req, res) {
  try {
    const search = req.body;
    const category = await Category.find({ isDeleted: false });
    const shuffleArray = (array) => {
      return array.sort(() => Math.random() - 0.5);
    };
    let productDB = await Product.find({
      isDeleted: false,
      categoryDeleted: false,
    });
    productDB = shuffleArray(productDB);
    if (search.searchContent != undefined) {
      const filteredProducts = productDB.filter((product) =>
        product.name.toLowerCase().includes(search.searchContent.toLowerCase())
      );
      res.render("user/user-shop", {
        search: true,
        resultFor: search.searchContent,
        category: category,
        searchProducts: filteredProducts,
        email: req.session.user,
        button: "allProductsBtn",
      });
    } else {
      res.render("user/user-shop", {
        category: category,
        products: productDB,
        email: req.session.user,
        button: "allProductsBtn",
      });
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    res.redirect(
      "/error?message=Something went wrong while fetching the products"
    );
  }
};

const category = async function (req, res) {
  try {
    const search = req.body;
    const catedoryName = req.params.id;
    const catedoryId = await Category.findOne({
      categoryName: catedoryName,
      isDeleted: false,
    });
    const category = await Category.find({ isDeleted: false });
    const shuffleArray = (array) => {
      return array.sort(() => Math.random() - 0.5);
    };
    let productDB = await Product.find({
      category: catedoryId._id,
      isDeleted: false,
      categoryDeleted: false,
    });
    productDB = shuffleArray(productDB);
    if (search.searchContent != undefined) {
      const filteredProducts = productDB.filter((product) =>
        product.name.toLowerCase().includes(search.searchContent.toLowerCase())
      );
      res.render("user/user-shop", {
        search: true,
        resultFor: search.searchContent,
        category: category,
        searchProducts: filteredProducts,
        email: req.session.user,
        button: catedoryName,
      });
    } else {
      res.render("user/user-shop", {
        category: category,
        products: productDB,
        email: req.session.user,
        button: catedoryName,
      });
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    res.redirect(
      "/error?message=Something went wrong while fetching the products"
    );
  }
};

const addTocart = async function (req, res) {
  try {
    const cart = req.body;
    const user = await User.findOne({ email: req.session.user, role: "user" });
    const exist = await Cart.findOne({ userId: user._id });
    if (exist) {
      // Check if product already exists in cart
      const existingItem = exist.items.find(
        (item) => item.productId.toString() === cart.productId
      );

      if (existingItem) {
        existingItem.quantity += Number(cart.quantity);
        if (existingItem.quantity > 10) {
          existingItem.quantity = 10; // Limit quantity to 10
        }
      } else {
        exist.items.push({
          productId: cart.productId,
          colour: cart.color,
          quantity: cart.quantity > 10 ? 10 : cart.quantity, // Limit to 10
        });
      }

      await exist.save(); // Save the updated cart
    } else {
      // If no cart exists, create a new one
      const newCart = new Cart({
        userId: user._id,
        items: [
          {
            productId: cart.productId, // Fixing incorrect property
            colour: cart.color,
            quantity: cart.quantity > 10 ? 10 : cart.quantity, // Limit to 10
          },
        ],
      });

      await newCart.save();
    }

    res.json({ add: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const showCart = async function (req, res) {
  try {
    const user = await User.findOne({ email: req.session.user, role: "user" });
    const category = await Category.find({ isDeleted: false });

    let totalAmount = 0;
    let validItems = [];
    let noItem = false;
    let noStocks = false;

    const cart = await Cart.findOne({ userId: user._id });

    if (!cart || cart.items.length === 0) {
      noItem = true;
    } else {
      // Fetch all products at once (performance improvement)
      const productIds = cart.items.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      const itemsWithDetails = cart.items.map((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId.toString()
        );

        if (!product || product.isDeleted || product.categoryDeleted)
          return null;

        const match =
          product.colors && Array.isArray(product.colors)
            ? product.colors.find((c) => c[0] === item.colour)
            : null;

        const stock = match ? match[1] : 0; // Default stock to 0 if not found
        if (stock == "0") {
          noStocks = true;
        }

        return {
          productId: product._id,
          name: product.name,
          description: product.description,
          price: product.categoryOfferPrice,
          offerPrice: product.offerPrice,
          image: product.productImage[0],
          brand: product.brand,
          size: product.size,
          stock: stock,
          selectedColor: item.colour,
          quantity: item.quantity > stock ? stock : item.quantity,
          totalPrice:
            (item.quantity > stock ? stock : item.quantity) *
            product.categoryOfferPrice,
          addedAt: item.addedAt,
        };
      });
      validItems = itemsWithDetails.filter(Boolean);

      if (validItems.length === 0) {
        noItem = true;
      }

      totalAmount = validItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }
    if (validItems.length != 0) {
      validItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }
    res.render("user/user-cart", {
      items: validItems,
      totalAmount: totalAmount,
      category: category,
      noItem,
      noStocks,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.redirect("/error?message=Something went wrong while fetching the cart");
  }
};

const editCart = async function (req, res) {
  try {
    const editCartdata = req.body;

    const user = await User.findOne({ email: req.session.user, role: "user" });
    if (!user) {
      return res.status(401).json({ error: "User not found or unauthorized" });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const product = cart.items.find(
      (item) => item.productId.toString() === editCartdata.id
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    product.quantity = Number(editCartdata.quantity);

    await cart.save();

    res.json({ updated: true });
  } catch (error) {
    console.error("Error updating cart:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while updating the cart" });
  }
};

const deleteCart = async function (req, res) {
  try {
    const { productId } = req.body;

    const user = await User.findOne({ email: req.session.user, role: "user" });
    if (!user) {
      return res.status(401).json({ error: "User not found or unauthorized" });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Filter out the product that needs to be removed
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.json({ deleted: true });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while deleting the item" });
  }
};

const account = async function (req, res) {
  try {
    const category = await Category.find({ isDeleted: false });

    res.render("user/user-account", {
      category: category,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.redirect({ error: "Something went wrong " });
  }
};

const coupon = async function (req, res) {
  try {
    const category = await Category.find({ isDeleted: false });
    const coupons = await Coupon.find({});
    const user = await User.findOne({ email: req.session.user, role: "user" });
    let userCoupon = user.coupon;
    userCoupon = userCoupon.filter((coupon) => !coupon.used);

    userCoupon.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));

    const filteredCoupons = coupon
      .filter((c) => userCoupon.some((uc) => uc.couponId.equals(c._id)))
      .map((c) => {
        const matchedCoupon = userCoupon.find((uc) =>
          uc.couponId.equals(c._id)
        );
        return { ...c.toObject(), addedAt: matchedCoupon?.addedAt };
      });

    res.render("user/user-coupon", {
      category: category,
      coupon: filteredCoupons,
    });

    let validCoupons = coupons.filter(
      (coupon) =>
        (user.totalPurchaseAmount >= coupon.minPurchase &&
          user.totalPurchaseAmount <= coupon.maxPurchase) ||
        user.totalPurchaseAmount > coupon.maxPurchase
    );

    validCoupons = validCoupons.filter(
      (vc) =>
        !user.coupon.some((uc) => uc.couponId.toString() === vc._id.toString())
    );

    const newCoupons = validCoupons.map((vc) => ({
      couponId: vc._id,
      used: false,
    }));

    if (newCoupons.length > 0) {
      user.coupon.push(...newCoupons);
      await user.save();
    }
    let total = newCoupons.length;
  } catch (error) {
    console.error("Error fetching page:", error);
    res.redirect({ error: "Something went wrong " });
  }
};

const orders = async function (req, res) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 5;
    let skip = (page - 1) * limit;

    const user = await User.findOne({ email: req.session.user, role: "user" });
    const category = await Category.find({ isDeleted: false });
    let order = await Order.find({ userId: user._id });
    order.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let totalItems = order.length;
    let totalPages = Math.ceil(totalItems / limit);
    order = order.slice(skip, skip + limit);
    res.render("user/user-orders", {
      category: category,
      order: order,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.redirect({ error: "Something went wrong " });
  }
};

const address = async function (req, res) {
  try {
    const category = await Category.find({ isDeleted: false });
    const user = await User.findOne({ email: req.session.user, role: "user" });
    const addressDB = await Address.findOne({ userId: user._id });
    if (addressDB) {
      res.render("user/user-address", {
        category: category,
        address: addressDB.addresses,
      });
    } else {
      res.render("user/user-address", {
        category: category,
        noDB: true,
      });
    }
  } catch (error) {
    console.error("Error fetching page:", error);
    res.redirect({ error: "Something went wrong " });
  }
};

const addAddress = async function (req, res) {
  try {
    const category = await Category.find({ isDeleted: false });

    const address = req.body;
    const user = await User.findOne({ email: req.session.user, role: "user" });
    let addressDB = await Address.findOne({ userId: user._id });

    if (addressDB) {
      const existingAddress = addressDB.addresses.find(
        (existing) =>
          existing.firstName === address.firstName &&
          existing.lastName === address.lastName &&
          existing.email === address.email &&
          existing.mobile === address.mobile &&
          existing.pincode === address.pincode &&
          existing.address === address.address &&
          existing.area === address.area &&
          existing.landmark === address.landmark &&
          existing.city === address.city &&
          existing.state === address.state
      );

      if (!existingAddress) {
        addressDB.addresses.push({
          firstName: address.firstName,
          lastName: address.lastName,
          email: address.email,
          mobile: address.mobile,
          pincode: address.pincode,
          address: address.address,
          area: address.area,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
        });
        await addressDB.save();
        return res.json({ added: true }); // Ensure response is sent here
      } else {
        return res.json({ added: false }); // Prevent further execution
      }
    } else {
      addressDB = new Address({
        userId: user._id,
        addresses: [
          {
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            mobile: address.mobile,
            pincode: address.pincode,
            address: address.address,
            area: address.area,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
          },
        ],
      });
      await addressDB.save();
      user.address = addressDB._id;
      await user.save();
      return res.json({ added: true }); // Ensure response is sent here
    }
  } catch (error) {
    console.error("Error adding address:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." }); // Ensure proper error handling
  }
};

const editAddress = async (req, res) => {
  try {
    const { id, ...updatedData } = req.body;
    const user = await User.findOne({ email: req.session.user, role: "user" });

    let addressDoc = await Address.findOne({ userId: user._id });

    if (!addressDoc) {
      return res.status(404).json({ message: "Address not found" });
    }

    let address = addressDoc.addresses.id(id);
    if (!address) {
      return res.status(404).json({ message: "Address entry not found" });
    }

    const existingAddress = addressDoc.addresses.find(
      (existing) =>
        existing.firstName === updatedData.firstName &&
        existing.lastName === updatedData.lastName &&
        existing.email === updatedData.email &&
        existing.mobile === updatedData.mobile &&
        existing.pincode === updatedData.pincode &&
        existing.address === updatedData.address &&
        existing.area === updatedData.area &&
        existing.landmark === updatedData.landmark &&
        existing.city === updatedData.city &&
        existing.state === updatedData.state
    );
    if (existingAddress) {
      return res.status(400).json({ edit: false });
    }

    // Update the address with the new data
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined) {
        address[key] = updatedData[key];
      }
    });

    addressDoc.updatedAt = Date.now();
    await addressDoc.save();

    res.status(200).json({ edit: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.body; // userId for reference, id for deleting specific address
    const user = await User.findOne({ email: req.session.user, role: "user" });

    if (!id) {
      return res.status(400).json({ message: "Address ID is required." });
    }

    const userAddress = await Address.findOne({ userId: user._id });

    if (!userAddress) {
      return res.status(404).json({ message: "Address record not found." });
    }

    userAddress.addresses = userAddress.addresses.filter(
      (address) => address._id.toString() !== id
    );

    await userAddress.save();

    res.status(200).json({ delete: true });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const placeOder = async (req, res) => {
  try {
    const category = await Category.find({ isDeleted: false });
    const user = await User.findOne({ email: req.session.user, role: "user" });
    const cart = await Cart.findOne({ userId: user._id });
    const walletDB = await Wallet.findOne({ userId: user._id });
    let wallet = walletDB?.balance ?? 0;
    let coupons = await Coupon.find({});

    const data = req.body;
    let validItems = "";
    let totalAmount = "";
    let actualTotalAmount = "";
    if (data.from == "cart") {
      const productIds = cart.items.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      const itemsWithDetails = cart.items.map((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId.toString()
        );

        if (!product || product.isDeleted || product.categoryDeleted)
          return null;

        const match =
          product.colors && Array.isArray(product.colors)
            ? product.colors.find((c) => c[0] === item.colour)
            : null;

        const stock = match ? match[1] : 0;

        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          priceTotal:
            (item.quantity > stock ? stock : item.quantity) * product.price,
          offerPrice: product.categoryOfferPrice,
          brand: product.brand,
          size: product.size,
          stock: stock,
          selectedColor: item.colour,
          quantity: item.quantity > stock ? stock : item.quantity,
          totalPrice:
            (item.quantity > stock ? stock : item.quantity) *
            product.categoryOfferPrice,
          category: product.category,
        };
      });

      validItems = itemsWithDetails.filter(Boolean);
      totalAmount = validItems.reduce((sum, item) => sum + item.totalPrice, 0);
      actualTotalAmount = validItems.reduce(
        (sum, item) => sum + item.priceTotal,
        0
      );

      let validCoupons = coupons.filter(
        (coupon) =>
          totalAmount >= coupon.minPurchase && totalAmount <= coupon.maxPurchase
      );
      validCoupons = validCoupons.filter(
        (vc) =>
          !user.coupon.some(
            (uc) => uc.couponId.toString() === vc._id.toString()
          ) && new Date(vc.expiresAt) > new Date()
      );
      console.log(validCoupons);

      res.render("user/user-placeoder", {
        category: category,
        productsData: validItems,
        totalAmount: totalAmount,
        actualTotalAmount: actualTotalAmount,
        cart: true,
        wallet: wallet,
        couponAv: validCoupons[0],
      });
    } else {
      let totalPrice = "";
      let actual = "";
      let productDetails = [];

      let id = data.id;
      const quantity = data.quantity;
      const colour = data.colour;

      id = new ObjectId(id);
      const product = await Product.findById(id).lean();

      const colorData = product.colors.find((c) => c[0] === colour);

      const selectedColor = colorData[0];
      const stock = colorData[1];

      const qty = parseInt(quantity) || 1;

      totalPrice = product.categoryOfferPrice * qty;
      actual = product.price * qty;

      productDetails.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        priceTotal: actual,
        offerPrice: product.categoryOfferPrice,
        brand: product.brand,
        size: product.size,
        stock: stock,
        selectedColor: selectedColor,
        quantity: qty,
        totalPrice: totalPrice,
        category: product.category,
      });

      let validCoupons = coupons.filter(
        (coupon) =>
          totalPrice >= coupon.minPurchase && totalPrice <= coupon.maxPurchase
      );
      validCoupons = validCoupons.filter(
        (vc) =>
          !user.coupon.some(
            (uc) => uc.couponId.toString() === vc._id.toString()
          ) && new Date(vc.expiresAt) > new Date()
      );
      console.log(validCoupons);

      res.render("user/user-placeoder", {
        category: category,
        productsData: productDetails,
        totalAmount: totalPrice,
        actualTotalAmount: actual,
        cart: false,
        wallet: wallet,
        couponAv: validCoupons[0],
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const placeOderAdrs = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user, role: "user" });
    const addressDB = await Address.findOne({ userId: user._id });
    if (addressDB.addresses.length == 0) {
      addressDB.addresses = [];
    }
    res.status(200).json({ address: addressDB.addresses });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const placeOderSub = async (req, res) => {
  try {
    const coupons = await Coupon.find({ status: "Active" });
    const category = await Category.find({ isDeleted: false });
    let data = req.body;
    let coupon = "";
    let discountAmount = "";
    const user = await User.findOne({ email: req.session.user, role: "user" });
    let addressDB = await Address.findOne({ userId: user._id });
    data.productsData = JSON.parse(data.productsData);
    if (data.paymentDetails) {
      data.paymentDetails = JSON.parse(data.paymentDetails);
    }
    await Promise.all(
      data.productsData.map(async (product) => {
        let dbProduct = await Product.findOne({
          _id: product.productId,
        }).select("productImage");
        if (dbProduct) {
          product.productImage = dbProduct.productImage;
        }
      })
    );
    discountAmount = Number(data.actualTotalAmount) - Number(data.totalAmount);
    if (data.applyed == "true") {
      coupon = await Coupon.findOne({ couponCode: data.couponCode });
    }

    let orderDB = new Order({
      userId: user._id,
      items: data.productsData,
      ...(data.applyed == "true" && {
        couponCode: data.couponCode,
        couponDiscount: coupon.discountValue,
      }),
      discountAmount: discountAmount,
      totalAmountNoOffer: data.actualTotalAmount,
      totalAmount: data.totalAmount,
      address: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        pincode: data.pincode,
        address: data.address,
        area: data.area,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
      },
      paymentId: {
        method: data.paymentType,
      },
    });
    await orderDB.save();
    if (data.payment == "COD") {
      let paymentDB = new Payment({
        userId: user._id,
        orderId: orderDB._id,
        amount: data.totalAmount,
        method: data.paymentType,
      });
      await paymentDB.save();
      orderDB.paymentId.paymentId = paymentDB._id;
      await orderDB.save();
    } else if (data.payment == "upi") {
      let amount = data.paymentDetails.amount / 100;
      let paymentDB = new Payment({
        userId: user._id,
        orderId: orderDB._id,
        paymentId: data.paymentDetails.id,
        amount: amount,
        method: data.paymentDetails.method,
      });
      await paymentDB.save();
      orderDB.paymentId.paymentId = paymentDB._id;
      await orderDB.save();
    } else if (data.payment == "wallet") {
      let paymentDB = new Payment({
        userId: user._id,
        orderId: orderDB._id,
        amount: data.totalAmount,
        method: data.paymentType,
      });
      await paymentDB.save();
      orderDB.paymentId.paymentId = paymentDB._id;
      await orderDB.save();
      let walletDB = await Wallet.findOne({ userId: user._id });
      if (walletDB) {
        walletDB.balance -= Number(data.totalAmount);
        await walletDB.save();
      }
    }
    user.orders.push(orderDB._id);
    user.totalPurchaseAmount += Number(data.totalAmount);
    await user.save();
    data.productsData.forEach(async (item) => {
      let product = await Product.findById(item.productId);
      product.quantity -= item.quantity;
      product.colors.forEach((color, i) => {
        if (color[0] == item.selectedColor) {
          color[1] -= item.quantity;
        }
      });
      await product.save();
    });
    if (data.from == "true") {
      await Cart.findOneAndDelete({ userId: user._id });
    }

    if (addressDB) {
      const existingAddress = addressDB.addresses.find(
        (existing) =>
          existing.firstName === data.firstName &&
          existing.lastName === data.lastName &&
          existing.email === data.email &&
          existing.mobile === data.mobile &&
          existing.pincode === data.pincode &&
          existing.address === data.address &&
          existing.area === data.area &&
          existing.landmark === data.landmark &&
          existing.city === data.city &&
          existing.state === data.state
      );

      if (!existingAddress) {
        addressDB.addresses.push({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          pincode: data.pincode,
          address: data.address,
          area: data.area,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
        });
        await addressDB.save();
      }
    } else {
      addressDB = new Address({
        userId: user._id,
        addresses: [
          {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            mobile: data.mobile,
            pincode: data.pincode,
            address: data.address,
            area: data.area,
            landmark: data.landmark,
            city: data.city,
            state: data.state,
          },
        ],
      });
      await addressDB.save();
      user.address = addressDB._id;
      await user.save();
    }

    res.render("user/user-thanks", {
      category: category,
      order: orderDB,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const razorpayapi = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user, role: "user" });
    let data = req.body;
    const options = {
      amount: Number(data.total) * 100, // Convert amount to paisa (INR)
      currency: "INR",
      receipt: "order_receipt_" + new Date().getTime(),
      payment_capture: 1, // Auto-capture payment after success
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    const generatedSignature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      return res.json({
        success: true,
        message: "Payment verified successfully",
        paymentDetails,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user, role: "user" });
    const date = new Date().toString();
    let messege = "";
    if (!user)
      return res.status(400).json({ apply: false, messege: "User not found" });

    let data = req.body;

    const couponDB = await Coupon.findOne({ couponCode: data.couponCode });
    if (!couponDB)
      return res.status(400).json({ apply, messege: "Invalid coupon code" });

    let userCoupon = user.coupon;
    if (!userCoupon) {
      user.coupon = [
        {
          couponId: couponDB._id,
          addedAt: date,
        },
      ];
    } else {
      userCoupon.push({
        couponId: couponDB._id,
        addedAt: date,
      });
    }
    await user.save();
    res.json({ apply: true, messege, couponDB });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ apply: false, messege: "Something went wrong" });
  }
};

const removeCoupon = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user, role: "user" });
    let messege = "";
    if (!user)
      return res.status(400).json({ apply: false, messege: "User not found" });

    let data = req.body;

    const couponDB = await Coupon.findOne({ couponCode: data.couponCode });
    if (!couponDB)
      return res.status(400).json({ apply, messege: "Invalid coupon code" });

    let userCoupon = user.coupon;
    let index = userCoupon.findIndex(
      (coupon) => coupon.couponId.toString() === couponDB._id.toString()
    );
    if (index !== -1) {
      userCoupon.splice(index, 1);
      await user.save();
    }

    await user.save();
    res.json({ apply: true, messege, couponDB });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ apply: false, messege: "Something went wrong" });
  }
};

const cancelOder = async (req, res) => {
  let { id } = req.body;
  const user = await User.findOne({ email: req.session.user, role: "user" });
  id = new ObjectId(id);
  let oder = await Order.findById(id);
  if (oder) {
    oder.items.forEach(async (item) => {
      let product = await Product.findById(item.productId);
      product.quantity += item.quantity;
      product.colors.forEach((color, i) => {
        if (color[0] == item.selectedColor) {
          color[1] = parseInt(color[1]) + parseInt(item.quantity);
        }
      });
      await product.save();
    });
    if (oder.couponCode) {
      let couponDB = await Coupon.findOne({ couponCode: oder.couponCode });
      let userCoupon = user.coupon;
      let index = userCoupon.findIndex(
        (coupon) => coupon.couponId.toString() === couponDB._id.toString()
      );
      if (index !== -1) {
        userCoupon.splice(index, 1);
        await user.save();
      }
    }
    oder.status = "cancelled";
    oder.deliveryStatus.cancelled = true;
    oder.deliveryStatus.cancelledDate = new Date();
    await oder.save();
    user.totalPurchaseAmount -= Number(oder.totalAmount);
    await user.save();
    let payDB = await Payment.findOne({ orderId: oder._id });
    payDB.payed = false;
    await payDB.save();
    if (oder.paymentId.method != "COD") {
      let walletDB = await Wallet.findOne({ userId: user._id });
      if (!walletDB) {
        walletDB = new Wallet({
          userId: user._id,
          balance: 0,
        });
      }
      walletDB.balance = walletDB.balance + Number(oder.totalAmount);
      await walletDB.save();
    }
    res.status(200).json({ cancel: true });
  }
};

const returnOder = async (req, res) => {
  let { id } = req.body;
  const user = await User.findOne({ email: req.session.user, role: "user" });
  id = new ObjectId(id);
  let oder = await Order.findById(id);
  if (oder) {
    oder.items.forEach(async (item) => {
      let product = await Product.findById(item.productId);
      product.quantity += item.quantity;
      product.colors.forEach((color, i) => {
        if (color[0] == item.selectedColor) {
          color[1] = parseInt(color[1]) + parseInt(item.quantity);
        }
      });
      await product.save();
    });
    if (oder.couponCode) {
      let couponDB = await Coupon.findOne({ couponCode: oder.couponCode });
      let userCoupon = user.coupon;
      let index = userCoupon.findIndex(
        (coupon) => coupon.couponId.toString() === couponDB._id.toString()
      );
      if (index !== -1) {
        userCoupon.splice(index, 1);
        await user.save();
      }
    }
    oder.status = "returned";
    oder.deliveryStatus.cancelled = true;
    oder.deliveryStatus.cancelledDate = new Date();
    oder.deliveryStatus.return = true;
    oder.deliveryStatus.returnDate = new Date();
    await oder.save();
    user.totalPurchaseAmount -= Number(oder.totalAmount);
    await user.save();
    let payDB = await Payment.findOne({ orderId: oder._id });
    payDB.payed = false;
    await payDB.save();
    if (oder.paymentId.method != "COD") {
      let walletDB = await Wallet.findOne({ userId: user._id });
      if (!walletDB) {
        walletDB = new Wallet({
          userId: user._id,
          balance: 0,
        });
      }
      walletDB.balance = walletDB.balance + Number(oder.totalAmount);
      await walletDB.save();
    }
    res.status(200).json({ cancel: true });
  }
};

const orderView = async (req, res) => {
  try {
    let orderid = req.params.orderid;
    orderid = new ObjectId(orderid);
    let isReturnExpired = false;
    const category = await Category.find({ isDeleted: false });
    let order = await Order.findOne({ _id: orderid });
    if (order.deliveryStatus.return) {
      let deliveredDate = new Date(order.deliveryStatus.deliveredDate);
      let diffDays = moment().diff(moment(deliveredDate), "days");
      isReturnExpired = diffDays > 7;
    }
    res.render("user/user-orderView", {
      category: category,
      order: order,
      isReturnExpired,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.redirect({ error: "Something went wrong " });
  }
};

const updateProfile = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.session.user, role: "user" });
    const category = await Category.find({ isDeleted: false });
    res.render("user/user-updateProfile", {
      user: user,
      category: category,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.session.user, role: "user" });
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.username = req.body.username;
    user.phoneNumber = req.body.mobile;
    await user.save();
    res.status(200).json({ edit: true });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const changePass = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.session.user, role: "user" });
    const category = await Category.find({ isDeleted: false });
    res.render("user/user-changePass", {
      category: category,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const changePasssub = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.session.user, role: "user" });
    let password = req.body.password;
    password = await bcrypt.hash(password, 10);
    user.password = password;
    await user.save();
    res.status(200).json({ changed: true });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const wishlist = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.session.user, role: "user" });
    let wishlistDB = await Wishlist.findOne({ userId: user._id });
    const category = await Category.find({ isDeleted: false });
    let validItems = [];
    let noItem = false;
    if (!wishlistDB || wishlistDB.items.length == 0) {
      noItem = true;
    } else {
      const productIds = wishlistDB.items.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      const itemsWithDetails = wishlistDB.items.map((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId.toString()
        );

        if (!product || product.isDeleted || product.categoryDeleted) {
          return null;
        }

        return {
          productId: product._id,
          name: product.name,
          price: product.categoryOfferPrice,
          image: product.productImage[0],
          size: product.size,
          addedAt: item.createdAt,
        };
      });

      validItems = itemsWithDetails.filter(Boolean);

      if (validItems.length === 0) {
        noItem = true;
      }
      if (validItems.length != 0) {
        validItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      }
    }
    res.render("user/user-wishlist", {
      items: validItems,
      noItem,
      category: category,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const addToWish = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.session.user, role: "user" });
    let id = new ObjectId(req.body.id);
    let product = await Product.findById(id);
    let wishlistDB = await Wishlist.findOne({ userId: user._id });
    let found = false;
    let added = false;

    if (!wishlistDB) {
      wishlistDB = new Wishlist({
        userId: user._id,
        items: [],
      });
      await wishlistDB.save();
    }

    wishlistDB.items.forEach((item) => {
      if (item.productId.toString() == product._id.toString()) {
        found = true;
      }
    });
    if (!found) {
      wishlistDB.items.push({
        productId: product._id,
        createdAt: new Date().toString(),
      });
      await wishlistDB.save();
      added = true;
    } else {
      added = false;
    }
    res.status(200).json({ added });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const removeFromWish = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.session.user, role: "user" });
    let id = new ObjectId(req.body.id);
    let wishlistDB = await Wishlist.findOne({ userId: user._id });
    let removed = false;
    wishlistDB.items.forEach((item, index) => {
      if (item.productId.toString() == id.toString()) {
        removed = true;
        wishlistDB.items.splice(index, 1);
      }
    });
    if (removed) {
      await wishlistDB.save();
    }
    res.status(200).json({ removed });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const showWallet = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user, role: "user" });
    const category = await Category.find({ isDeleted: false });
    let payDB = await Payment.find({ userId: user._id });
    payDB = payDB.filter((item) => item.method === "wallet");
    const wallet = await Wallet.findOne({ userId: user._id });
    let val = true;
    if (!wallet) {
      val = false;
    }
    payDB.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.render("user/user-wallet", {
      category: category,
      payDB: payDB,
      wallet: wallet,
      val: val,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.redirect({ error: "Something went wrong " });
  }
};

const logOut = function (req, res) {
  try {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.redirect({ error: "Something went wrong " });
  }
};

module.exports = {
  home,
  loginSub,
  sessionCheck,
  getVerifyOtp,
  authController,
  signUp,
  signupSub,
  backToSign_in,
  forgotPass,
  forgotPassOtp,
  getForgotpassOtp,
  restPass,
  restPassSub,
  forgotPassOtpSub,
  backTolog,
  rsntPasOtp,
  productSingle,
  submitReview,
  noReturn,
  shop,
  category,
  addTocart,
  showCart,
  editCart,
  deleteCart,
  account,
  coupon,
  orders,
  address,
  addAddress,
  editAddress,
  deleteAddress,
  placeOder,
  placeOderSub,
  verifyPayment,
  razorpayapi,
  applyCoupon,
  removeCoupon,
  placeOderAdrs,
  cancelOder,
  returnOder,
  orderView,
  updateProfile,
  editProfile,
  changePass,
  changePasssub,
  wishlist,
  addToWish,
  removeFromWish,
  showWallet,
  logOut,
};
