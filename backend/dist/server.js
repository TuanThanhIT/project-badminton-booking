"use strict";

var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _cors = _interopRequireDefault(require("cors"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _db = _interopRequireDefault(require("./config/db.js"));
var _http = require("http");
var _index = require("./socket/index.js");
var _errorHandler = _interopRequireDefault(require("./middlewares/errorHandler.js"));
require("./models/index.js");
var _authRoute = _interopRequireDefault(require("./routes/user/authRoute.js"));
var _cateRoute = _interopRequireDefault(require("./routes/user/cateRoute.js"));
var _productRoute = _interopRequireDefault(require("./routes/user/productRoute.js"));
var _branchRoute = _interopRequireDefault(require("./routes/user/branchRoute.js"));
var _courtRoute = _interopRequireDefault(require("./routes/user/courtRoute.js"));
var _bookingRoute = _interopRequireDefault(require("./routes/user/bookingRoute.js"));
var _cartRoute = _interopRequireDefault(require("./routes/user/cartRoute.js"));
var _walletRoute = _interopRequireDefault(require("./routes/user/walletRoute.js"));
var _addressRoute = _interopRequireDefault(require("./routes/user/addressRoute.js"));
var _postRoute = _interopRequireDefault(require("./routes/user/postRoute.js"));
var _postSocialRoute = _interopRequireDefault(require("./routes/user/postSocialRoute.js"));
var _profileRoute = _interopRequireDefault(require("./routes/user/profileRoute.js"));
var _conversationRoute = _interopRequireDefault(require("./routes/user/conversationRoute.js"));
var _userSearchRoute = _interopRequireDefault(require("./routes/user/userSearchRoute.js"));
var _orderRoute = _interopRequireDefault(require("./routes/user/orderRoute.js"));
var _discountRoute = _interopRequireDefault(require("./routes/user/discountRoute.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
var app = (0, _express["default"])();
var PORT = process.env.PORT || 8088;
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: true
}));
app.use((0, _cors["default"])({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use((0, _cookieParser["default"])());

// User
(0, _authRoute["default"])(app);
(0, _cateRoute["default"])(app);
(0, _productRoute["default"])(app);
(0, _branchRoute["default"])(app);
(0, _courtRoute["default"])(app);
(0, _bookingRoute["default"])(app);
(0, _cartRoute["default"])(app);
(0, _walletRoute["default"])(app);
(0, _addressRoute["default"])(app);
(0, _orderRoute["default"])(app);
(0, _discountRoute["default"])(app);

// Post
(0, _postRoute["default"])(app);
(0, _postSocialRoute["default"])(app);
(0, _profileRoute["default"])(app);
(0, _conversationRoute["default"])(app);
(0, _userSearchRoute["default"])(app);

// create http server
var httpServer = (0, _http.createServer)(app);

// init socket
(0, _index.initSocket)(httpServer);
app.use(_errorHandler["default"]);
_db["default"].sync().then(function () {
  console.log("Database synced");
  httpServer.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
  });
});