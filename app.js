var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var session = require("express-session");
// var fileUpload = require("express-fileupload");
var db = require("./config/connection");
var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");
var app = express();
const Handlebars = require("handlebars");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);
Handlebars.registerHelper('ifCheck',function(arg1,arg2,options){
  return(arg1==arg2)?options.fn(this):options.inverse(this)
})

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "Key", cookie: { maxAge: 60000000000000 } }));
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-cache, private,no-store,must-revalidate,max-stale=0,pre-check=0"
  );
  next();
});
// app.use(fileUpload());
// mongodb connection
db.connect((err) => {
  if (err) console.log("Error occured" + err);
  else console.log("Database Connection established");
});
Handlebars.registerHelper("inc", function (num) {
  return num + 1;
});
// creating adminRouter
app.use("/admin", adminRouter);

// creating usersRouter
app.use("/", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
