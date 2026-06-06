"use strict";

var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _cors = _interopRequireDefault(require("cors"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _db = require("./config/db.js");
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
var _monthlyBookingRoute = _interopRequireDefault(require("./routes/user/monthlyBookingRoute.js"));
var _orderRoute = _interopRequireDefault(require("./routes/user/orderRoute.js"));
var _discountRoute = _interopRequireDefault(require("./routes/user/discountRoute.js"));
var _orderRoute2 = _interopRequireDefault(require("./routes/employee/orderRoute.js"));
var _workShiftRoute = _interopRequireDefault(require("./routes/employee/workShiftRoute.js"));
var _counterRoute = _interopRequireDefault(require("./routes/employee/counterRoute.js"));
var _bookingRoute2 = _interopRequireDefault(require("./routes/employee/bookingRoute.js"));
var _webhookRoute = _interopRequireDefault(require("./routes/user/webhookRoute.js"));
var _courtRoute2 = _interopRequireDefault(require("./routes/manager/courtRoute.js"));
var _branchRoute2 = _interopRequireDefault(require("./routes/manager/branchRoute.js"));
var _employeeRoute = _interopRequireDefault(require("./routes/manager/employeeRoute.js"));
var _beverageRoute = _interopRequireDefault(require("./routes/manager/beverageRoute.js"));
var _productRoute2 = _interopRequireDefault(require("./routes/manager/productRoute.js"));
var _workShiftRoute2 = _interopRequireDefault(require("./routes/manager/workShiftRoute.js"));
var _salaryRoute = _interopRequireDefault(require("./routes/manager/salaryRoute.js"));
var _revenueRoute = _interopRequireDefault(require("./routes/manager/revenueRoute.js"));
var _orderRoute3 = _interopRequireDefault(require("./routes/manager/orderRoute.js"));
var _bookingRoute3 = _interopRequireDefault(require("./routes/manager/bookingRoute.js"));
var _conversationRoute2 = _interopRequireDefault(require("./routes/manager/conversationRoute.js"));
var _supplierRoute = _interopRequireDefault(require("./routes/manager/supplierRoute.js"));
var _purchaseReceiptRoute = _interopRequireDefault(require("./routes/manager/purchaseReceiptRoute.js"));
var _inventoryRoute = _interopRequireDefault(require("./routes/manager/inventoryRoute.js"));
var _feedbackRoute = _interopRequireDefault(require("./routes/user/feedbackRoute.js"));
var _notificationRoute = _interopRequireDefault(require("./routes/user/notificationRoute.js"));
var _homeRoute = _interopRequireDefault(require("./routes/user/homeRoute.js"));
var _userRoute = _interopRequireDefault(require("./routes/admin/userRoute.js"));
var _branchRoute3 = _interopRequireDefault(require("./routes/admin/branchRoute.js"));
var _managerRoute = _interopRequireDefault(require("./routes/admin/managerRoute.js"));
var _productRoute3 = _interopRequireDefault(require("./routes/admin/productRoute.js"));
var _beverageRoute2 = _interopRequireDefault(require("./routes/admin/beverageRoute.js"));
var _postRoute2 = _interopRequireDefault(require("./routes/admin/postRoute.js"));
var _discountRoute2 = _interopRequireDefault(require("./routes/admin/discountRoute.js"));
var _feedbackRoute2 = _interopRequireDefault(require("./routes/admin/feedbackRoute.js"));
var _financeRoute = _interopRequireDefault(require("./routes/admin/financeRoute.js"));
var _revenueRoute2 = _interopRequireDefault(require("./routes/admin/revenueRoute.js"));
var _categoryRoute = _interopRequireDefault(require("./routes/admin/categoryRoute.js"));
var _uploadRoute = _interopRequireDefault(require("./routes/admin/uploadRoute.js"));
var _coachApplicationRoute = _interopRequireDefault(require("./routes/admin/coachApplicationRoute.js"));
var _coachClassRoute = _interopRequireDefault(require("./routes/user/coachClassRoute.js"));
var _coachApplicationRoute2 = _interopRequireDefault(require("./routes/user/coachApplicationRoute.js"));
var _supplierRoute2 = _interopRequireDefault(require("./routes/admin/supplierRoute.js"));
var _purchaseReceiptRoute2 = _interopRequireDefault(require("./routes/admin/purchaseReceiptRoute.js"));
var _inventoryRoute2 = _interopRequireDefault(require("./routes/admin/inventoryRoute.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
_dotenv["default"].config();
var app = (0, _express["default"])();
var PORT = process.env.PORT || 8080;
var allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: true
}));
app.use((0, _cors["default"])({
  origin: function origin(_origin, callback) {
    if (!_origin || allowedOrigins.includes(_origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use((0, _cookieParser["default"])());

// User
(0, _homeRoute["default"])(app);
(0, _authRoute["default"])(app);
(0, _cateRoute["default"])(app);
(0, _productRoute["default"])(app);
(0, _branchRoute["default"])(app);
(0, _courtRoute["default"])(app);
(0, _bookingRoute["default"])(app);
(0, _cartRoute["default"])(app);
(0, _walletRoute["default"])(app);
(0, _addressRoute["default"])(app);
(0, _monthlyBookingRoute["default"])(app);
(0, _orderRoute["default"])(app);
(0, _discountRoute["default"])(app);
(0, _webhookRoute["default"])(app);
(0, _feedbackRoute["default"])(app);
(0, _notificationRoute["default"])(app);

// Post
(0, _postRoute["default"])(app);
(0, _postSocialRoute["default"])(app);
(0, _profileRoute["default"])(app);
(0, _conversationRoute["default"])(app);
(0, _userSearchRoute["default"])(app);
(0, _coachClassRoute["default"])(app);
(0, _coachApplicationRoute2["default"])(app);

// Employee
(0, _orderRoute2["default"])(app);
(0, _workShiftRoute["default"])(app);
(0, _counterRoute["default"])(app);
(0, _bookingRoute2["default"])(app);

// Admin
(0, _userRoute["default"])(app);
(0, _branchRoute3["default"])(app);
(0, _managerRoute["default"])(app);
(0, _productRoute3["default"])(app);
(0, _beverageRoute2["default"])(app);
(0, _postRoute2["default"])(app);
(0, _discountRoute2["default"])(app);
(0, _feedbackRoute2["default"])(app);
(0, _financeRoute["default"])(app);
(0, _revenueRoute2["default"])(app);
(0, _categoryRoute["default"])(app);
(0, _uploadRoute["default"])(app);
(0, _coachApplicationRoute["default"])(app);
(0, _supplierRoute2["default"])(app);
(0, _purchaseReceiptRoute2["default"])(app);
(0, _inventoryRoute2["default"])(app);

// Manager
(0, _courtRoute2["default"])(app);
(0, _branchRoute2["default"])(app);
(0, _employeeRoute["default"])(app);
(0, _beverageRoute["default"])(app);
(0, _productRoute2["default"])(app);
(0, _workShiftRoute2["default"])(app);
(0, _salaryRoute["default"])(app);
(0, _revenueRoute["default"])(app);
(0, _orderRoute3["default"])(app);
(0, _bookingRoute3["default"])(app);
(0, _conversationRoute2["default"])(app);
(0, _supplierRoute["default"])(app);
(0, _purchaseReceiptRoute["default"])(app);
(0, _inventoryRoute["default"])(app);
// create http server
var httpServer = (0, _http.createServer)(app);

// init socket
(0, _index.initSocket)(httpServer);
app.use(_errorHandler["default"]);
var startServer = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return (0, _db.testConnection)();
        case 1:
          httpServer.listen(PORT, function () {
            console.log("Server running on http://localhost:".concat(PORT));
          });
        case 2:
          return _context.a(2);
      }
    }, _callee);
  }));
  return function startServer() {
    return _ref.apply(this, arguments);
  };
}();
startServer()["catch"](function (error) {
  console.error("Unable to start server:", error);
  process.exit(1);
});