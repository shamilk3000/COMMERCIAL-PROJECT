const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../Models/userModel");
require("dotenv").config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALL_BACK_URL = process.env.CALL_BACK_URL

passport.use(
  new GoogleStrategy(
    {
      clientID:GOOGLE_CLIENT_ID,
      clientSecret:GOOGLE_CLIENT_SECRET,
      callbackURL:CALL_BACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails[0].value,
          role: "user",
        });

        if (!user) {
          const name = profile.name.givenName + profile.name.familyName;

          user = await User.create({
            googleId: profile.id,
            username: name,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profile: profile.photos[0].value,
            role: "user",
            updatedBy: profile.emails[0].value,
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
