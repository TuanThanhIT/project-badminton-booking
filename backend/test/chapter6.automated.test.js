import request from "supertest";
import { beforeAll, beforeEach, afterAll, describe, expect, test } from "vitest";
import createApp from "../src/app.js";
import sequelize from "../src/config/db.js";
import {
  closeDatabase,
  cleanDatabase,
  recreateTestDatabase,
  runMigrations,
} from "./helpers/database.js";
import {
  assignEmployeeToBranch,
  assignManagerToBranch,
  createActiveCashierShift,
  createAddress,
  createBooking,
  createBranch,
  createCartWithItem,
  createCatalogItem,
  createCourt,
  createCourtPricesForAllDays,
  createOtp,
  createPurchaseReceipt,
  createUser,
  futurePlayDate,
  Payment,
  seedRoles,
  VariantStock,
} from "./helpers/factories.js";
import { authHeader, tokenFor } from "./helpers/auth.js";
import { ROLE_NAME, OTP_TYPE } from "../src/constants/userConstant.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
} from "../src/constants/paymentConstant.js";
import { BOOKING_STATUS } from "../src/constants/bookingConstant.js";
import { ORDER_STATUS } from "../src/constants/orderConstant.js";

const app = createApp();

const createBranchCourtFixture = async () => {
  const branch = await createBranch();
  const court = await createCourt(branch.id);
  await createCourtPricesForAllDays(branch.id);
  return { branch, court };
};

const createOrderCheckoutFixture = async ({ stock = 10, quantity = 1 } = {}) => {
  const { user } = await createUser({ walletBalance: 1000000 });
  const token = tokenFor(user, ROLE_NAME.USER);
  const branch = await createBranch();
  const { variant } = await createCatalogItem({ branchId: branch.id, stock });
  const address = await createAddress(user.id);
  const { cart, cartItem } = await createCartWithItem({
    userId: user.id,
    variantId: variant.id,
    quantity,
  });

  const previewBody = {
    cartId: cart.id,
    addressId: address.id,
    cartItemIds: [cartItem.id],
  };

  await request(app)
    .post("/user/orders/checkout/preview")
    .set(authHeader(token))
    .send(previewBody)
    .expect(200);

  await request(app)
    .post("/user/orders/checkout/shipping")
    .set(authHeader(token))
    .send({ cartId: cart.id })
    .expect(200);

  return { user, token, branch, variant, cart, cartItem, address };
};

beforeAll(async () => {
  await recreateTestDatabase();
  runMigrations();
  await sequelize.authenticate();
});

beforeEach(async () => {
  await cleanDatabase();
  await seedRoles();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Chapter 6 automated system test cases", () => {
  test("TC01 register success", async () => {
    const res = await request(app).post("/user/auth/register").send({
      username: "new_user",
      email: "new_user@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
  });

  test("TC02 reject duplicate email registration", async () => {
    await createUser({ username: "dup_user", email: "dup@example.com" });

    const res = await request(app).post("/user/auth/register").send({
      username: "other_user",
      email: "dup@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(409);
  });

  test("TC03 verify valid account OTP", async () => {
    const { user } = await createUser({
      username: "otp_user",
      email: "otp@example.com",
      isVerified: false,
    });
    await createOtp({ user, otpCode: "123456", type: OTP_TYPE.REGISTER });

    const res = await request(app).post("/user/auth/verify-account").send({
      email: "otp@example.com",
      otpCode: "123456",
    });

    expect(res.status).toBe(200);
  });

  test("TC04 login success", async () => {
    await createUser({
      username: "login_user",
      email: "login@example.com",
      password: "Password123!",
    });

    const res = await request(app).post("/user/auth/login").send({
      username: "login_user",
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.data?.accessToken).toBeTruthy();
  });

  test("TC05 reject wrong password", async () => {
    await createUser({ username: "bad_pass", password: "Password123!" });

    const res = await request(app).post("/user/auth/login").send({
      username: "bad_pass",
      password: "Wrong123!",
    });

    expect(res.status).toBe(400);
  });

  test("TC06 create booking for a free slot", async () => {
    const { user } = await createUser({ walletBalance: 1000000 });
    const { branch, court } = await createBranchCourtFixture();

    const res = await request(app)
      .post("/user/bookings")
      .set(authHeader(tokenFor(user, ROLE_NAME.USER)))
      .send({
        branchId: branch.id,
        courtId: court.id,
        playDate: futurePlayDate(),
        startTime: "10:00",
        endTime: "11:00",
        paymentMethod: PAYMENT_METHOD_STATUS.COD,
      });

    expect(res.status).toBe(201);
  });

  test("TC07 reject overlapping booking", async () => {
    const { user } = await createUser({ walletBalance: 1000000 });
    const { branch, court } = await createBranchCourtFixture();
    await createBooking({
      userId: user.id,
      branchId: branch.id,
      courtId: court.id,
      status: BOOKING_STATUS.PENDING,
    });

    const res = await request(app)
      .post("/user/bookings")
      .set(authHeader(tokenFor(user, ROLE_NAME.USER)))
      .send({
        branchId: branch.id,
        courtId: court.id,
        playDate: futurePlayDate(),
        startTime: "10:30",
        endTime: "11:30",
        paymentMethod: PAYMENT_METHOD_STATUS.COD,
      });

    expect(res.status).toBe(400);
  });

  test("TC08 create wallet booking payment when balance is enough", async () => {
    const { user } = await createUser({ walletBalance: 1000000 });
    const { branch, court } = await createBranchCourtFixture();

    const res = await request(app)
      .post("/user/bookings")
      .set(authHeader(tokenFor(user, ROLE_NAME.USER)))
      .send({
        branchId: branch.id,
        courtId: court.id,
        playDate: futurePlayDate(),
        startTime: "12:00",
        endTime: "13:00",
        paymentMethod: PAYMENT_METHOD_STATUS.WALLET,
      });

    expect(res.status).toBe(201);
  });

  test("TC09 reject wallet booking payment when balance is insufficient", async () => {
    const { user } = await createUser({ walletBalance: 0 });
    const { branch, court } = await createBranchCourtFixture();

    const res = await request(app)
      .post("/user/bookings")
      .set(authHeader(tokenFor(user, ROLE_NAME.USER)))
      .send({
        branchId: branch.id,
        courtId: court.id,
        playDate: futurePlayDate(),
        startTime: "12:00",
        endTime: "13:00",
        paymentMethod: PAYMENT_METHOD_STATUS.WALLET,
      });

    expect(res.status).toBe(400);
  });

  test("TC10 create order success", async () => {
    const { token, cart, cartItem, address } = await createOrderCheckoutFixture();

    const res = await request(app)
      .post("/user/orders")
      .set(authHeader(token))
      .send({
        cartId: cart.id,
        addressId: address.id,
        cartItemIds: [cartItem.id],
        paymentMethod: PAYMENT_METHOD_STATUS.COD,
      });

    expect(res.status).toBe(201);
  });

  test("TC11 reject order when stock is insufficient", async () => {
    const { user } = await createUser();
    const token = tokenFor(user, ROLE_NAME.USER);
    const branch = await createBranch();
    const { variant } = await createCatalogItem({ branchId: branch.id, stock: 1 });
    const address = await createAddress(user.id);
    const { cart, cartItem } = await createCartWithItem({
      userId: user.id,
      variantId: variant.id,
      quantity: 2,
    });

    const res = await request(app)
      .post("/user/orders/checkout/preview")
      .set(authHeader(token))
      .send({ cartId: cart.id, addressId: address.id, cartItemIds: [cartItem.id] });

    expect(res.status).toBe(400);
  });

  test("TC12 employee confirms valid booking", async () => {
    const { user } = await createUser();
    const { user: employee } = await createUser({ roleName: ROLE_NAME.EMPLOYEE });
    const { branch, court } = await createBranchCourtFixture();
    await assignEmployeeToBranch(employee.id, branch.id);
    await createActiveCashierShift({ employeeId: employee.id, branchId: branch.id });
    const booking = await createBooking({ userId: user.id, branchId: branch.id, courtId: court.id });

    const res = await request(app)
      .patch(`/employee/bookings/${booking.id}/confirm`)
      .set(authHeader(tokenFor(employee, ROLE_NAME.EMPLOYEE, [branch.id])));

    expect(res.status).toBe(200);
  });

  test("TC13 reject employee handling another branch booking", async () => {
    const { user } = await createUser();
    const { user: employee } = await createUser({ roleName: ROLE_NAME.EMPLOYEE });
    const ownBranch = await createBranch();
    const { branch, court } = await createBranchCourtFixture();
    await assignEmployeeToBranch(employee.id, ownBranch.id);
    await createActiveCashierShift({ employeeId: employee.id, branchId: ownBranch.id });
    const booking = await createBooking({ userId: user.id, branchId: branch.id, courtId: court.id });

    const res = await request(app)
      .patch(`/employee/bookings/${booking.id}/confirm`)
      .set(authHeader(tokenFor(employee, ROLE_NAME.EMPLOYEE, [ownBranch.id])));

    expect(res.status).toBe(403);
  });

  test("TC14 manager creates court in own branch", async () => {
    const { user: manager } = await createUser({ roleName: ROLE_NAME.MANAGER });
    const branch = await createBranch();
    await assignManagerToBranch(manager.id, branch.id);

    const res = await request(app)
      .post("/manager/courts")
      .set(authHeader(tokenFor(manager, ROLE_NAME.MANAGER, [branch.id])))
      .send({
        courtName: "Manager Court",
        location: "Floor 2",
        thumbnailUrl: "https://example.test/court.jpg",
      });

    expect(res.status).toBe(201);
    expect(res.body.data?.branchId).toBe(branch.id);
  });

  test("TC15 reject manager updating another branch court", async () => {
    const { user: manager } = await createUser({ roleName: ROLE_NAME.MANAGER });
    const ownBranch = await createBranch();
    const otherBranch = await createBranch();
    await assignManagerToBranch(manager.id, ownBranch.id);
    const court = await createCourt(otherBranch.id);

    const res = await request(app)
      .put(`/manager/courts/${court.id}`)
      .set(authHeader(tokenFor(manager, ROLE_NAME.MANAGER, [ownBranch.id])))
      .send({ courtName: "Forbidden Update" });

    expect(res.status).toBe(404);
  });

  test("TC16 admin locks user", async () => {
    const { user: admin } = await createUser({ roleName: ROLE_NAME.ADMIN });
    const { user } = await createUser();

    const res = await request(app)
      .put(`/admin/users/${user.id}/toggle-active`)
      .set(authHeader(tokenFor(admin, ROLE_NAME.ADMIN)));

    expect(res.status).toBe(200);
  });

  test("TC17 reject USER calling ADMIN API", async () => {
    const { user } = await createUser();

    const res = await request(app)
      .get("/admin/users")
      .set(authHeader(tokenFor(user, ROLE_NAME.USER)));

    expect(res.status).toBe(403);
  });

  test("TC18 approve purchase receipt updates inventory", async () => {
    const { user: admin } = await createUser({ roleName: ROLE_NAME.ADMIN });
    const { user: manager } = await createUser({ roleName: ROLE_NAME.MANAGER });
    const branch = await createBranch();
    await assignManagerToBranch(manager.id, branch.id);
    const { variant } = await createCatalogItem({ branchId: branch.id, stock: 1 });
    const receipt = await createPurchaseReceipt({
      branchId: branch.id,
      managerId: manager.id,
      variantId: variant.id,
      quantity: 5,
    });

    const res = await request(app)
      .patch(`/admin/purchase-receipts/${receipt.id}/approve`)
      .set(authHeader(tokenFor(admin, ROLE_NAME.ADMIN)));

    const stock = await VariantStock.findOne({
      where: { branchId: branch.id, variantId: variant.id },
    });

    expect(res.status).toBe(200);
    expect(Number(stock.stock)).toBe(6);
  });

  test("TC19 rollback when order creation fails after creating records", async () => {
    const { token, cart, cartItem, address, branch, variant } =
      await createOrderCheckoutFixture({ stock: 1, quantity: 1 });
    await VariantStock.update(
      { stock: 0 },
      { where: { branchId: branch.id, variantId: variant.id } },
    );

    const beforeGroups = await sequelize.models.OrderGroup.count();
    const res = await request(app)
      .post("/user/orders")
      .set(authHeader(token))
      .send({
        cartId: cart.id,
        addressId: address.id,
        cartItemIds: [cartItem.id],
        paymentMethod: PAYMENT_METHOD_STATUS.COD,
      });
    const afterGroups = await sequelize.models.OrderGroup.count();

    expect(res.status).toBe(400);
    expect(afterGroups).toBe(beforeGroups);
  });

  test("TC20 reject invalid VNPay signature callback", async () => {
    const { user } = await createUser();
    const booking = await createBooking({
      userId: user.id,
      branchId: (await createBranch()).id,
      courtId: (await createCourt((await createBranch()).id)).id,
    });
    await Payment.create({
      paymentAmount: 100000,
      paymentMethod: PAYMENT_METHOD_STATUS.VNPAY,
      paymentStatus: PAYMENT_STATUS.PENDING,
      targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
      targetPaymentId: booking.id,
      externalId: "bad-signature-ref",
    });

    const res = await request(app)
      .patch("/user/bookings/vnpay/callback")
      .set(authHeader(tokenFor(user, ROLE_NAME.USER)))
      .send({
        vnp_Amount: "10000000",
        vnp_OrderInfo: `booking_${booking.id}`,
        vnp_ResponseCode: "00",
        vnp_TmnCode: "TEST",
        vnp_TransactionNo: "123456",
        vnp_TransactionStatus: "00",
        vnp_TxnRef: "bad-signature-ref",
        vnp_SecureHash: "invalid",
      });

    expect(res.status).toBe(400);
  });
});
