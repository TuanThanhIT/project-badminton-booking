import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  Branch,
  BranchImage,
  BranchManager,
  User,
  Profile,
  Court,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import ConflictError from "../../errors/ConflictError.js";

const getAdminBranchesService = async (data) => {
  const { page = 1, limit = 10, search, isActive } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { branchName: { [Op.like]: `%${search}%` } },
      { address: { [Op.like]: `%${search}%` } },
      { provinceName: { [Op.like]: `%${search}%` } },
    ];
  }
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
        through: { attributes: [], where: { isActive: true } },
        required: false,
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName"],
          },
        ],
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const branches = rows.map((b) => {
    const branch = b.toJSON();
    return {
      ...branch,
      fullAddress: `${branch.address}, ${branch.wardName || ""}, ${branch.districtName}, ${branch.provinceName}`.replace(", ,", ","),
      managers: branch.managers?.map((m) => ({
        id: m.id,
        username: m.username,
        email: m.email,
        fullName: m.profile?.fullName,
      })) || [],
    };
  });

  return {
    branches,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
    },
  };
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
        through: { attributes: [], where: { isActive: true } },
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
  const {
    branchName,
    phoneNumber,
    description,
    address,
    districtName,
    provinceName,
    wardName,
    provinceId,
    districtId,
    wardCode,
    latitude,
    longitude,
    ghnShopId,
  } = data;

  const existing = await Branch.findOne({ where: { branchName } });
  if (existing) throw new ConflictError("Tên chi nhánh đã tồn tại");

  const branch = await Branch.create({
    branchName,
    phoneNumber,
    description,
    address,
    districtName,
    provinceName,
    wardName: wardName || null,
    provinceId,
    districtId,
    wardCode: wardCode || null,
    latitude,
    longitude,
    isActive: true,
    ghnShopId: ghnShopId || null,
  });

  return branch;
};

const updateBranchService = async (branchId, data) => {
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");

  if (data.branchName && data.branchName !== branch.branchName) {
    const existing = await Branch.findOne({
      where: { branchName: data.branchName, id: { [Op.ne]: branchId } },
    });
    if (existing) throw new ConflictError("Tên chi nhánh đã tồn tại");
  }

  await branch.update(data);
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

const adminBranchService = {
  getAdminBranchesService,
  getAdminBranchDetailService,
  createBranchService,
  updateBranchService,
  toggleBranchActiveService,
  addBranchImageService,
  deleteBranchImageService,
};

export default adminBranchService;
