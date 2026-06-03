import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  BeverageStock,
  Branch,
  BranchEmployee,
  BranchImage,
  BranchManager,
  Booking,
  Court,
  Order,
  OrderGroup,
  Profile,
  PurchaseReceipt,
  Supplier,
  User,
  VariantStock,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import ConflictError from "../../errors/ConflictError.js";
import inventoryQueryService from "../shared/inventoryQueryService.js";
import revenueReportService from "../shared/revenueReportService.js";

const BRANCH_MUTABLE_FIELDS = [
  "branchName",
  "phoneNumber",
  "description",
  "address",
  "districtName",
  "provinceName",
  "wardName",
  "provinceId",
  "districtId",
  "wardCode",
  "latitude",
  "longitude",
  "ghnShopId",
];

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return Number(value);
};

const getPagination = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const buildPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(Number(total || 0) / Number(limit || 1)), 1),
});

const buildFullAddress = (branch) =>
  [branch.address, branch.wardName, branch.districtName, branch.provinceName]
    .filter(Boolean)
    .join(", ");

const mapManager = (manager) => ({
  id: manager.id,
  username: manager.username,
  email: manager.email,
  fullName: manager.profile?.fullName,
  phoneNumber: manager.profile?.phoneNumber,
  avatar: manager.profile?.avatar,
});

const assertBranchExists = async (branchId) => {
  const branch = await Branch.findByPk(Number(branchId));
  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");
  return branch;
};

const normalizeBranchPayload = (data, { partial = false } = {}) => {
  const payload = {};

  BRANCH_MUTABLE_FIELDS.forEach((field) => {
    if (data[field] !== undefined) payload[field] = data[field];
  });

  ["branchName", "phoneNumber", "description", "address", "districtName", "provinceName", "wardName", "wardCode"].forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== null) {
      payload[field] = String(payload[field]).trim();
    }
  });

  ["provinceId", "districtId"].forEach((field) => {
    if (payload[field] !== undefined) payload[field] = Number(payload[field]);
  });

  ["latitude", "longitude"].forEach((field) => {
    if (payload[field] !== undefined) payload[field] = Number(payload[field]);
  });

  if (payload.ghnShopId !== undefined) {
    payload.ghnShopId = toOptionalNumber(payload.ghnShopId);
  }

  if (partial) {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    );
  }

  return {
    ...payload,
    wardName: payload.wardName || null,
    wardCode: payload.wardCode || null,
    ghnShopId: payload.ghnShopId || null,
    isActive: true,
  };
};

const getAdminBranchesService = async (data) => {
  const { page, limit, offset } = getPagination(data);
  const { search, isActive, status, districtName, provinceName } = data;

  const where = {};
  if (search) {
    where[Op.or] = [
      { branchName: { [Op.like]: `%${search}%` } },
      { address: { [Op.like]: `%${search}%` } },
      { phoneNumber: { [Op.like]: `%${search}%` } },
      { districtName: { [Op.like]: `%${search}%` } },
      { provinceName: { [Op.like]: `%${search}%` } },
      { "$managers.username$": { [Op.like]: `%${search}%` } },
      { "$managers.email$": { [Op.like]: `%${search}%` } },
      { "$managers.profile.fullName$": { [Op.like]: `%${search}%` } },
    ];
  }
  if (districtName) where.districtName = { [Op.like]: `%${districtName}%` };
  if (provinceName) where.provinceName = { [Op.like]: `%${provinceName}%` };
  if (status === "ACTIVE") where.isActive = true;
  if (status === "LOCKED") where.isActive = false;
  if (status === "MAINTENANCE") where.id = -1;
  if (isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true" || isActive === true;
  }

  const { rows, count } = await Branch.findAndCountAll({
    where,
    attributes: [
      "id",
      "branchName",
      "address",
      "wardName",
      "districtName",
      "provinceName",
      "phoneNumber",
      "isActive",
      "createdAt",
    ],
    include: [
      {
        model: User,
        as: "managers",
        attributes: ["id", "username", "email"],
        through: { attributes: ["isActive"] },
        required: false,
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "phoneNumber", "avatar"],
          },
        ],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
    subQuery: false,
  });

  const branches = await Promise.all(rows.map(async (b) => {
    const branch = b.toJSON();
    const [courtCount, employeeCount] = await Promise.all([
      Court.count({ where: { branchId: branch.id } }),
      BranchEmployee.count({ where: { branchId: branch.id } }),
    ]);

    const managers = branch.managers?.map(mapManager) || [];

    return {
      id: branch.id,
      branchName: branch.branchName,
      address: branch.address,
      wardName: branch.wardName,
      districtName: branch.districtName,
      provinceName: branch.provinceName,
      fullAddress: buildFullAddress(branch),
      phoneNumber: branch.phoneNumber,
      isActive: branch.isActive,
      status: branch.isActive ? "ACTIVE" : "LOCKED",
      managers,
      manager: managers[0] || null,
      courtCount,
      employeeCount,
      createdAt: branch.createdAt,
    };
  }));

  return {
    branches,
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const getAdminBranchOptionsService = async () => {
  const branches = await Branch.findAll({
    attributes: ["id", "branchName", "isActive"],
    order: [["branchName", "ASC"]],
  });

  return branches.map((branch) => branch.toJSON());
};

const getAdminBranchDetailService = async (branchId) => {
  const branch = await Branch.findByPk(branchId, {
    include: [
      {
        model: BranchImage,
        as: "images",
        attributes: ["id", "imageUrl"],
      },
      {
        model: User,
        as: "managers",
        attributes: ["id", "username", "email"],
        through: { attributes: [] },
        required: false,
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "phoneNumber", "avatar"],
          },
        ],
      },
      {
        model: Court,
        as: "courts",
        attributes: ["id", "courtName", "courtStatus"],
      },
    ],
  });

  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");

  const data = branch.toJSON();
  return {
    ...data,
    fullAddress: `${data.address}, ${data.wardName || ""}, ${data.districtName}, ${data.provinceName}`.replace(", ,", ","),
    managers: data.managers?.map((m) => ({
      id: m.id,
      username: m.username,
      email: m.email,
      fullName: m.profile?.fullName,
      phoneNumber: m.profile?.phoneNumber,
      avatar: m.profile?.avatar,
    })) || [],
  };
};

const createBranchService = async (data) => {
  const payload = normalizeBranchPayload(data);
  const { branchName } = payload;

  const existing = await Branch.findOne({ where: { branchName } });
  if (existing) throw new ConflictError("Tên chi nhánh đã tồn tại");

  const branch = await Branch.create(payload);

  return branch;
};

const updateBranchService = async (branchId, data) => {
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");

  const payload = normalizeBranchPayload(data, { partial: true });

  if (payload.branchName && payload.branchName !== branch.branchName) {
    const existing = await Branch.findOne({
      where: { branchName: payload.branchName, id: { [Op.ne]: branchId } },
    });
    if (existing) throw new ConflictError("Tên chi nhánh đã tồn tại");
  }

  await branch.update(payload);
  return branch;
};

const toggleBranchActiveService = async (branchId) => {
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");

  await branch.update({ isActive: !branch.isActive });

  return {
    id: branch.id,
    branchName: branch.branchName,
    isActive: branch.isActive,
  };
};

const addBranchImageService = async (branchId, imageUrl) => {
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");
  const image = await BranchImage.create({ branchId: Number(branchId), imageUrl });
  return image;
};

const deleteBranchImageService = async (branchId, imageId) => {
  const image = await BranchImage.findOne({
    where: { id: Number(imageId), branchId: Number(branchId) },
  });
  if (!image) throw new NotFoundError("Không tìm thấy ảnh");
  await image.destroy();
};


const getAdminBranchOverviewService = async (branchId) => {
  await assertBranchExists(branchId);

  const [
    courtCount,
    employeeCount,
    managerCount,
    bookingCount,
    orderCount,
    pendingPurchaseReceiptCount,
    variantStockCount,
    beverageStockCount,
    dashboard,
  ] = await Promise.all([
    Court.count({ where: { branchId } }),
    BranchEmployee.count({ where: { branchId } }),
    BranchManager.count({ where: { branchId, isActive: true } }),
    Booking.count({ where: { branchId } }),
    Order.count({ where: { branchId } }),
    PurchaseReceipt.count({ where: { branchId, status: "PENDING" } }),
    VariantStock.count({ where: { branchId } }),
    BeverageStock.count({ where: { branchId } }),
    revenueReportService.buildDashboard({
      branchId: Number(branchId),
      range: "today",
    }),
  ]);

  return {
    summary: {
      courtCount,
      employeeCount,
      managerCount,
      bookingCount,
      orderCount,
      pendingPurchaseReceiptCount,
      inventoryItemCount: variantStockCount + beverageStockCount,
      todayRevenue: dashboard.summary?.todayRevenue || 0,
      pendingBookingCount: dashboard.summary?.pendingBookingCount || 0,
      pendingOrderCount: dashboard.summary?.pendingOrderCount || 0,
      lowStockCount: dashboard.summary?.lowStockCount || 0,
      outOfStockCount: dashboard.summary?.outOfStockCount || 0,
    },
    dashboard,
  };
};

const getAdminBranchCourtsService = async (branchId, query = {}) => {
  await assertBranchExists(branchId);
  const { page, limit, offset } = getPagination(query);
  const where = { branchId };

  if (query.status) where.courtStatus = query.status;
  if (query.search) where.courtName = { [Op.like]: `%${query.search}%` };

  const { rows, count } = await Court.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    items: rows.map((row) => row.toJSON()),
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const getAdminBranchEmployeesService = async (branchId, query = {}) => {
  await assertBranchExists(branchId);
  const { page, limit, offset } = getPagination(query);

  const { rows, count } = await BranchEmployee.findAndCountAll({
    where: { branchId },
    include: [
      {
        model: User,
        as: "employee",
        attributes: ["id", "username", "email", "isActive", "createdAt"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "phoneNumber", "avatar"],
          },
        ],
      },
    ],
    distinct: true,
    limit,
    offset,
    subQuery: false,
  });

  return {
    items: rows.map((row) => {
      const employee = row.toJSON().employee || {};
      return {
        id: employee.id,
        username: employee.username,
        email: employee.email,
        isActive: employee.isActive,
        fullName: employee.profile?.fullName,
        phoneNumber: employee.profile?.phoneNumber,
        avatar: employee.profile?.avatar,
        createdAt: employee.createdAt,
      };
    }),
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const getAdminBranchBookingsService = async (branchId, query = {}) => {
  await assertBranchExists(branchId);
  const { page, limit, offset } = getPagination(query);
  const where = { branchId };

  if (query.status) where.bookingStatus = query.status;

  const { rows, count } = await Booking.findAndCountAll({
    where,
    attributes: ["id", "bookingStatus", "totalAmount", "userId", "note", "createdAt"],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "phoneNumber", "avatar"],
          },
        ],
      },
    ],
    distinct: true,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    items: rows.map((row) => row.toJSON()),
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const getAdminBranchOrdersService = async (branchId, query = {}) => {
  await assertBranchExists(branchId);
  const { page, limit, offset } = getPagination(query);
  const where = { branchId };

  if (query.status) where.orderStatus = query.status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    attributes: [
      "id",
      "orderStatus",
      "shippingStatus",
      "shippingName",
      "shippingPhone",
      "totalAmount",
      "createdAt",
      "orderGroupId",
    ],
    include: [
      {
        model: OrderGroup,
        as: "orderGroup",
        attributes: ["id", "userId", "createdAt"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "email"],
            include: [
              {
                model: Profile,
                as: "profile",
                attributes: ["fullName", "avatar"],
              },
            ],
          },
        ],
      },
    ],
    distinct: true,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    items: rows.map((row) => row.toJSON()),
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const getAdminBranchInventoryService = async (branchId, query = {}) => {
  await assertBranchExists(branchId);
  const [variantStocks, beverageStocks] = await Promise.all([
    inventoryQueryService.getVariantStocksService({ branchId, query }),
    inventoryQueryService.getBeverageStocksService({ branchId, query }),
  ]);

  return {
    variantStocks: variantStocks.variantStocks,
    beverageStocks: beverageStocks.beverageStocks,
    pagination: {
      variantStocks: variantStocks.pagination,
      beverageStocks: beverageStocks.pagination,
    },
  };
};

const getAdminBranchPurchaseReceiptsService = async (branchId, query = {}) => {
  await assertBranchExists(branchId);
  const { page, limit, offset } = getPagination(query);
  const where = { branchId };

  if (query.status) where.status = query.status;

  const { rows, count } = await PurchaseReceipt.findAndCountAll({
    where,
    include: [
      { model: Supplier, as: "supplier", attributes: ["id", "supplierName", "phoneNumber"] },
      { model: User, as: "creator", attributes: ["id", "username", "email"] },
      { model: User, as: "approver", attributes: ["id", "username", "email"], required: false },
    ],
    distinct: true,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    items: rows.map((row) => row.toJSON()),
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const getAdminBranchStockHistoryService = async (branchId, query = {}) => {
  await assertBranchExists(branchId);
  return inventoryQueryService.getStockTransactionsService({ branchId, query });
};

const getAdminBranchRevenueService = async (branchId, query = {}) => {
  await assertBranchExists(branchId);
  return revenueReportService.buildRevenueReport({
    branchId: Number(branchId),
    query,
    includeProfit: true,
  });
};
const adminBranchService = {
  getAdminBranchesService,
  getAdminBranchOptionsService,
  getAdminBranchDetailService,
  createBranchService,
  updateBranchService,
  toggleBranchActiveService,
  addBranchImageService,
  deleteBranchImageService,
  getAdminBranchOverviewService,
  getAdminBranchCourtsService,
  getAdminBranchEmployeesService,
  getAdminBranchBookingsService,
  getAdminBranchOrdersService,
  getAdminBranchInventoryService,
  getAdminBranchPurchaseReceiptsService,
  getAdminBranchStockHistoryService,
  getAdminBranchRevenueService,
};

export default adminBranchService;
