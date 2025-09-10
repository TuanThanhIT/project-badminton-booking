"use strict";

var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _db = _interopRequireDefault(require("./config/db.js"));
var _roleRoute = _interopRequireDefault(require("./routes/admin/roleRoute.js"));
var _webRoute = _interopRequireDefault(require("./routes/customer/webRoute.js"));
var _authRoute = _interopRequireDefault(require("./routes/customer/authRoute.js"));
var _errorHandling = require("./middlewares/errorHandling.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
var app = (0, _express["default"])();
var PORT = process.env.PORT || 8088;
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: true
}));

// Customer
(0, _webRoute["default"])(app);
(0, _authRoute["default"])(app);

// Admin
(0, _roleRoute["default"])(app);
app.use(_errorHandling.errorHandlingMiddleware);
_db["default"].sync({
  force: false
}).then(function () {
  console.log("Database synced");
  app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
  });
});