const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");
require("./Configure/googleOauth20");
const handlebars = require("express-handlebars");
const hbs = require("hbs");
require("./Configure/MongoDBConfig");
require("dotenv").config();
const env = process.env;
const helpers = require("./Configure/hbsHelpers");
const adminRouter = require("./Routes/admin");
const usersRouter = require("./Routes/users");

app.set("views", path.join(__dirname, "Views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(nocache());
app.use(
  session({
    secret: env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
  })
);

app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views");

Object.entries(helpers).forEach(([name, fn]) => {
  hbs.registerHelper(name, fn);
});

app.use("/admin", adminRouter);
app.use("/", usersRouter);

app.listen(env.port, () => {
  const date = new Date().toString();
  console.log("Server started at " + date);
  console.log("Server started on port 5000");
});
