"use strict";

var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _webRoute = _interopRequireDefault(require("./routes/webRoute.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
var app = (0, _express["default"])();
var PORT = process.env.PORT || 8088;
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: true
}));
(0, _webRoute["default"])(app);
app.listen(PORT, function () {
  console.log("Server is listening on port http://localhost:".concat(PORT));
});