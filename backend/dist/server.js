"use strict";

var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _cors = _interopRequireDefault(require("cors"));
var _db = _interopRequireDefault(require("./config/db.js"));
var _http = require("http");
var _index = require("./socket/index.js");
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
var _discountRoute = _interopRequireDefault(require("./routes/admin/discountRoute.js"));
var _discountRoute2 = _interopRequireDefault(require("./routes/customer/discountRoute.js"));
var _orderRoute = _interopRequireDefault(require("./routes/customer/orderRoute.js"));
var _momoRoute = _interopRequireDefault(require("./routes/customer/momoRoute.js"));
var _productFeedbackRoute = _interopRequireDefault(require("./routes/customer/productFeedbackRoute.js"));
var _contactRoute = _interopRequireDefault(require("./routes/customer/contactRoute.js"));
var _courtRoute = _interopRequireDefault(require("./routes/admin/courtRoute.js"));
var _courtRoute2 = _interopRequireDefault(require("./routes/customer/courtRoute.js"));
var _discountBooking = _interopRequireDefault(require("./routes/customer/discountBooking.js"));
var _discountBookingRoute = _interopRequireDefault(require("./routes/admin/discountBookingRoute.js"));
var _bookingRoute = _interopRequireDefault(require("./routes/customer/bookingRoute.js"));
var _bookingFeedbackRoute = _interopRequireDefault(require("./routes/customer/bookingFeedbackRoute.js"));
var _authRoute2 = _interopRequireDefault(require("./routes/employee/authRoute.js"));
var _workShiftRoute = _interopRequireDefault(require("./routes/admin/workShiftRoute.js"));
var _workShiftRoute2 = _interopRequireDefault(require("./routes/employee/workShiftRoute.js"));
var _orderRoute2 = _interopRequireDefault(require("./routes/employee/orderRoute.js"));
var _bookingRoute2 = _interopRequireDefault(require("./routes/employee/bookingRoute.js"));
var _courtRoute3 = _interopRequireDefault(require("./routes/employee/courtRoute.js"));
var _beverageRoute = _interopRequireDefault(require("./routes/admin/beverageRoute.js"));
var _beverageRoute2 = _interopRequireDefault(require("./routes/employee/beverageRoute.js"));
var _productRoute3 = _interopRequireDefault(require("./routes/employee/productRoute.js"));
var _draftRoute = _interopRequireDefault(require("./routes/employee/draftRoute.js"));
var _offlineRoute = _interopRequireDefault(require("./routes/employee/offlineRoute.js"));
var _notificationRoute = _interopRequireDefault(require("./routes/employee/notificationRoute.js"));
var _notificationRoute2 = _interopRequireDefault(require("./routes/customer/notificationRoute.js"));
var _authRoute3 = _interopRequireDefault(require("./routes/admin/authRoute.js"));
var _usersRoute = _interopRequireDefault(require("./routes/admin/usersRoute.js"));
var _orderRoute3 = _interopRequireDefault(require("./routes/admin/orderRoute.js"));
var _bookingRoute3 = _interopRequireDefault(require("./routes/admin/bookingRoute.js"));
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
(0, _discountRoute2["default"])(app);
(0, _orderRoute["default"])(app);
(0, _momoRoute["default"])(app);
(0, _productFeedbackRoute["default"])(app);
(0, _contactRoute["default"])(app);
(0, _courtRoute2["default"])(app);
(0, _discountBooking["default"])(app);
(0, _bookingRoute["default"])(app);
(0, _bookingFeedbackRoute["default"])(app);

// Admin
(0, _authRoute3["default"])(app);
(0, _roleRoute["default"])(app);
(0, _cateRoute["default"])(app);
(0, _productRoute["default"])(app);
(0, _discountRoute["default"])(app);
(0, _courtRoute["default"])(app);
(0, _discountBookingRoute["default"])(app);
(0, _workShiftRoute["default"])(app);
(0, _beverageRoute["default"])(app);
(0, _notificationRoute2["default"])(app);
(0, _usersRoute["default"])(app);
(0, _orderRoute3["default"])(app);
(0, _bookingRoute3["default"])(app);

// Employee
(0, _authRoute2["default"])(app);
(0, _workShiftRoute2["default"])(app);
(0, _orderRoute2["default"])(app);
(0, _bookingRoute2["default"])(app);
(0, _courtRoute3["default"])(app);
(0, _beverageRoute2["default"])(app);
(0, _productRoute3["default"])(app);
(0, _draftRoute["default"])(app);
(0, _offlineRoute["default"])(app);
(0, _notificationRoute["default"])(app);

// create http server
var httpServer = (0, _http.createServer)(app);

// init socket
(0, _index.initSocket)(httpServer);
app.use(_errorHandling.errorHandlingMiddleware);
_db["default"].sync({
  force: false
}).then(function () {
  console.log("Database synced");
  httpServer.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
  });
});