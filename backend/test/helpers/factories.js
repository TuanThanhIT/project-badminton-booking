import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  Booking,
  BookingDetail,
  Branch,
  BranchEmployee,
  BranchManager,
  Cart,
  CartItem,
  Category,
  Court,
  CourtPrice,
  Order,
  OrderDetail,
  OrderGroup,
  Payment,
  Product,
  ProductVariant,
  Profile,
  PurchaseReceipt,
  PurchaseReceiptDetail,
  Role,
  Supplier,
  User,
  UserAddress,
  UserOtp,
  VariantStock,
  Wallet,
  WorkShift,
  WorkShiftEmployee,
} from "../../src/models/index.js";
import { ROLE_NAME, OTP_TYPE } from "../../src/constants/userConstant.js";
import { WALLET_STATUS } from "../../src/constants/paymentConstant.js";
import { BOOKING_STATUS } from "../../src/constants/bookingConstant.js";
import { DAY_OF_WEEK, PERIOD_TYPE } from "../../src/constants/courtConstant.js";
import {
  PURCHASE_RECEIPT_STATUS,
  STOCK_ITEM_TYPE,
} from "../../src/constants/inventoryConstant.js";
import {
  ROLE_IN_SHIFT,
  WORK_SHIFT_STATUS,
} from "../../src/constants/workShiftConstant.js";

let sequence = 1;

const next = (prefix) => `${prefix}_${sequence++}`;

export const seedRoles = async () => {
  const roleIds = {
    [ROLE_NAME.ADMIN]: 1,
    [ROLE_NAME.USER]: 2,
    [ROLE_NAME.EMPLOYEE]: 3,
    [ROLE_NAME.COACH]: 4,
    [ROLE_NAME.MANAGER]: 5,
  };
  const roles = {};
  for (const roleName of [
    ROLE_NAME.ADMIN,
    ROLE_NAME.USER,
    ROLE_NAME.EMPLOYEE,
    ROLE_NAME.COACH,
    ROLE_NAME.MANAGER,
  ]) {
    const [role] = await Role.findOrCreate({
      where: { roleName },
      defaults: { id: roleIds[roleName] },
    });
    roles[roleName] = role;
  }
  return roles;
};

export const createUser = async ({
  roleName = ROLE_NAME.USER,
  username = next("user"),
  email = `${username}@example.com`,
  password = "Password123!",
  isVerified = true,
  isActive = true,
  walletBalance = 0,
} = {}) => {
  const roles = await seedRoles();
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashed,
    isVerified,
    isActive,
    roleId: roles[roleName].id,
  });

  await Profile.create({ userId: user.id });
  await Wallet.create({
    userId: user.id,
    balance: walletBalance,
    status: WALLET_STATUS.ACTIVE,
  });

  return { user, password };
};

export const createOtp = async ({ user, otpCode = "123456", type = OTP_TYPE.REGISTER } = {}) => {
  return UserOtp.create({
    userId: user.id,
    otpCode: crypto.createHash("sha256").update(otpCode).digest("hex"),
    otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    type,
  });
};

export const createBranch = async (overrides = {}) => {
  const label = next("branch");
  return Branch.create({
    branchName: `Test Branch ${label}`,
    phoneNumber: "0912345678",
    description: "Branch used for automated tests",
    address: "123 Test Street",
    districtName: "District 1",
    provinceName: "Ho Chi Minh",
    wardName: "Ward 1",
    provinceId: 202,
    districtId: 1442,
    wardCode: "20101",
    latitude: 10.776,
    longitude: 106.7,
    isActive: true,
    ghnShopId: 12345,
    ...overrides,
  });
};

export const assignManagerToBranch = (managerId, branchId) =>
  BranchManager.create({ managerId, branchId, isActive: true });

export const assignEmployeeToBranch = (employeeId, branchId) =>
  BranchEmployee.create({ employeeId, branchId });

export const createActiveCashierShift = async ({ employeeId, branchId } = {}) => {
  const shift = await WorkShift.create({
    branchId,
    shiftName: `Cashier ${next("shift")}`,
    workDate: new Date().toISOString().slice(0, 10),
    startTime: "08:00",
    endTime: "22:00",
    cashierShiftWage: 100000,
    staffShiftWage: 80000,
    shiftStatus: WORK_SHIFT_STATUS.INPROGRESS,
  });

  return WorkShiftEmployee.create({
    workShiftId: shift.id,
    employeeId,
    roleInShift: ROLE_IN_SHIFT.CASHIER,
    checkIn: new Date(),
    checkOut: null,
  });
};

export const createCourt = async (branchId, overrides = {}) => {
  return Court.create({
    branchId,
    courtName: `Court ${next("A")}`,
    location: "Floor 1",
    thumbnailUrl: "https://example.test/court.jpg",
    ...overrides,
  });
};

export const createCourtPricesForAllDays = async (branchId, overrides = {}) => {
  return Promise.all(
    Object.values(DAY_OF_WEEK).map((dayOfWeek) =>
      CourtPrice.create({
        branchId,
        dayOfWeek,
        startTime: "08:00",
        endTime: "22:00",
        price: 100000,
        periodType: PERIOD_TYPE.DAYTIME,
        ...overrides,
      }),
    ),
  );
};

export const futurePlayDate = (offsetDays = 3) => {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
};

export const createBooking = async ({ userId, branchId, courtId, status = BOOKING_STATUS.PENDING } = {}) => {
  const booking = await Booking.create({
    userId,
    branchId,
    totalAmount: 100000,
    bookingStatus: status,
  });

  await BookingDetail.create({
    bookingId: booking.id,
    courtId,
    playDate: futurePlayDate(),
    startTime: "10:00",
    endTime: "11:00",
    price: 100000,
  });

  return booking;
};

export const createCatalogItem = async ({ branchId, stock = 10 } = {}) => {
  const category = await Category.create({
    cateName: `Category ${next("cat")}`,
    menuGroup: "SHOP",
  });
  const product = await Product.create({
    productName: `Racket ${next("prod")}`,
    brand: "Yonex",
    description: "Automated test product",
    thumbnailUrl: "https://example.test/product.jpg",
    categoryId: category.id,
  });
  const variant = await ProductVariant.create({
    productId: product.id,
    sku: next("sku"),
    price: 200000,
    discount: 0,
    color: "Black",
    size: "4U",
    material: "Graphite",
    weight: 0.3,
  });
  await VariantStock.create({ branchId, variantId: variant.id, stock });

  return { category, product, variant };
};

export const createCartWithItem = async ({ userId, variantId, quantity = 1, price = 200000 } = {}) => {
  const cart = await Cart.create({ userId, totalAmount: quantity * price });
  const cartItem = await CartItem.create({
    cartId: cart.id,
    variantId,
    quantity,
    subTotal: quantity * price,
  });
  return { cart, cartItem };
};

export const createAddress = (userId) =>
  UserAddress.create({
    userId,
    fullName: "Nguyen Van A",
    phoneNumber: "0912345678",
    address: "123 Test Street",
    provinceName: "Ho Chi Minh",
    districtName: "District 1",
    wardName: "Ward 1",
    provinceId: 202,
    districtId: 1442,
    wardCode: "20101",
    latitude: 10.775,
    longitude: 106.699,
    isDefault: true,
  });

export const createOrderFixture = async ({ userId, branchId, variantId, quantity = 1 } = {}) => {
  const group = await OrderGroup.create({
    userId,
    totalAmount: 200000 * quantity,
    totalShippingFee: 30000,
    finalAmount: 200000 * quantity + 30000,
  });
  const order = await Order.create({
    orderGroupId: group.id,
    branchId,
    subtotal: 200000 * quantity,
    shippingFee: 30000,
    totalAmount: 230000 * quantity,
    shippingName: "Nguyen Van A",
    shippingPhone: "0912345678",
    shippingAddress: "123 Test Street",
    shippingDistrictId: 1442,
    shippingWardCode: "20101",
    shippingWeight: 0.3 * quantity,
    shippingServiceId: 53320,
  });
  await OrderDetail.create({
    orderId: order.id,
    variantId,
    productName: "Racket",
    quantity,
    unitPrice: 200000,
    variantInfo: "Black / 4U",
  });
  return { group, order };
};

export const createPurchaseReceipt = async ({ branchId, managerId, variantId, quantity = 5 } = {}) => {
  const supplier = await Supplier.create({
    supplierName: `Supplier ${next("sup")}`,
    phoneNumber: "0912345678",
    email: `${next("supplier")}@example.com`,
    address: "Supplier address",
  });
  const receipt = await PurchaseReceipt.create({
    receiptCode: next("PR"),
    branchId,
    supplierId: supplier.id,
    createdBy: managerId,
    status: PURCHASE_RECEIPT_STATUS.PENDING,
    totalAmount: quantity * 100000,
  });
  await PurchaseReceiptDetail.create({
    purchaseReceiptId: receipt.id,
    itemType: STOCK_ITEM_TYPE.PRODUCT_VARIANT,
    variantId,
    itemName: "Racket",
    quantity,
    importPrice: 100000,
  });
  return receipt;
};

export { Payment, VariantStock };
