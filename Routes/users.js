const express = require("express");
const router = express.Router();
const user = require("../Controllers/userController");

router.get("/", user.home);
router.post("/", user.home);
router.get("/sessionCheck", user.sessionCheck, user.home);
router.post("/loginSub", user.loginSub);
router.get("/auth/google", user.authController.googleAuth);
router.get(
  "/auth/google/callback",
  user.authController.googleCallback,
  user.authController.handleCallback
);
router.get("/getVerify-otp", user.getVerifyOtp);
router.post("/verify-otp", user.authController.verifyOtp);
router.post("/resend-otp", user.authController.resendOtp);
router.get("/backToSign_in", user.backToSign_in);
router.get("/signUp", user.signUp);
router.post("/signupSub", user.signupSub);
router.get("/forgotPass", user.forgotPass);
router.post("/forgotPassOtp", user.forgotPassOtp);
router.get("/getForgotpassOtp", user.getForgotpassOtp);
router.post("/forgotPassOtpSub", user.forgotPassOtpSub);
router.get("/restPass", user.restPass);
router.post("/restPassSub", user.restPassSub);
router.get("/backTolog", user.backTolog);
router.post("/rsntPasOtp", user.rsntPasOtp);
router.get("/productSingle", user.sessionCheck, user.productSingle);
router.post("/submit-review", user.sessionCheck, user.submitReview);
router.get("/shop", user.shop);
router.get("/shop/:id", user.category);
router.post("/shop", user.shop);
router.post("/shop/:id", user.category);
router.post("/api/addTocart", user.sessionCheck, user.addTocart);
router.get("/showCart", user.sessionCheck, user.showCart);
router.patch("/api/editCart", user.sessionCheck, user.editCart);
router.delete("/api/deleteCart", user.sessionCheck, user.deleteCart);
router.get("/account", user.sessionCheck, user.account);
router.get("/coupon", user.sessionCheck, user.coupon);
router.get("/orders", user.sessionCheck, user.orders);
router.get("/address", user.sessionCheck, user.address);
router.post("/api/addAddress", user.sessionCheck, user.addAddress);
router.patch("/api/editAddress", user.sessionCheck, user.editAddress);
router.delete("/api/deleteAddress", user.sessionCheck, user.deleteAddress);
router.post("/placeOder", user.sessionCheck, user.placeOder);
router.post("/api/applyCoupon", user.sessionCheck, user.applyCoupon);
router.post("/api/removeCoupon", user.sessionCheck, user.removeCoupon);
router.post("/placeOderSub", user.sessionCheck, user.placeOderSub);
router.post("/api/razorpayapi", user.sessionCheck, user.razorpayapi);
router.post("/api/verify-payment", user.sessionCheck, user.verifyPayment);
router.get("/api/placeOderAdrs", user.sessionCheck, user.placeOderAdrs);
router.post("/api/cancelOder", user.sessionCheck, user.cancelOder);
router.post("/api/returnOder", user.sessionCheck, user.returnOder);
router.get("/orderView/:orderid", user.sessionCheck, user.orderView);
router.get("/updateProfile", user.sessionCheck, user.updateProfile);
router.patch("/api/editProfile", user.sessionCheck, user.editProfile);
router.get("/changePass", user.sessionCheck, user.changePass);
router.patch("/api/changePasssub", user.sessionCheck, user.changePasssub);
router.get("/wishlist", user.sessionCheck, user.wishlist);
router.patch("/api/addToWish", user.sessionCheck, user.addToWish);
router.patch("/api/removeFromWish", user.sessionCheck, user.removeFromWish);
router.get("/wallet",user.sessionCheck ,user.showWallet)
router.get("/logOut", user.sessionCheck, user.logOut);

module.exports = router;
