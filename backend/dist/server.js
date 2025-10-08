"use strict";

var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _cors = _interopRequireDefault(require("cors"));
var _db = _interopRequireDefault(require("./config/db.js"));
var _roleRoute = _interopRequireDefault(require("./routes/admin/roleRoute.js"));
var _webRoute = _interopRequireDefault(require("./routes/customer/webRoute.js"));
var _authRoute = _interopRequireDefault(require("./routes/customer/authRoute.js"));
var _errorHandling = require("./middlewares/errorHandling.js");
var _userRoute = _interopRequireDefault(require("./routes/customer/userRoute.js"));
var _cateRoute = _interopRequireDefault(require("./routes/admin/cateRoute.js"));
var _cateRoute2 = _interopRequireDefault(require("./routes/customer/cateRoute.js"));
var _productRoute = _interopRequireDefault(require("./routes/admin/productRoute.js"));
var _productRoute2 = _interopRequireDefault(require("./routes/customer/productRoute.js"));
var _cartRoute = _interopRequireDefault(require("./routes/customer/cartRoute.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
var app = (0, _express["default"])();
var PORT = process.env.PORT || 8088;
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: true
}));
app.use((0, _cors["default"])());

// Customer
(0, _webRoute["default"])(app);
(0, _authRoute["default"])(app);
(0, _userRoute["default"])(app);
(0, _cateRoute2["default"])(app);
(0, _productRoute2["default"])(app);
(0, _cartRoute["default"])(app);

// Admin
(0, _roleRoute["default"])(app);
(0, _cateRoute["default"])(app);
(0, _productRoute["default"])(app);
app.use(_errorHandling.errorHandlingMiddleware);
_db["default"].sync({
  force: false
}).then(function () {
  console.log("Database synced");
  app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
  });
});