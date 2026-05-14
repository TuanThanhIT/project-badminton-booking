import { Branch, BranchImage, Profile, User } from "../../models/index.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";

const getBranchOptionsService = async () => {
  const branches = await Branch.findAll({
    where: {
      isActive: true,
    },
    attributes: ["id", "branchName"],
    order: [["branchName", "ASC"]],
  });

  return branches;
};

const getPagedBranchesService = async (data) => {
  const { page = 1, limit = 10, provinceName, districtName } = data;

  const offset = (page - 1) * limit;

  const where = {
    isActive: true,
  };

  if (provinceName) {
    where.provinceName = {
      [Op.like]: `%${provinceName}%`,
    };
  }

  if (districtName) {
    where.districtName = {
      [Op.like]: `%${districtName}%`,
    };
  }

  const { rows, count } = await Branch.findAndCountAll({
    attributes: [
      "id",
      "branchName",
      "address",
      "wardName",
      "districtName",
      "provinceName",
      "phoneNumber",
      "latitude",
      "longitude",
    ],
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdDate", "DESC"]],
  });

  const branches = rows.map((item) => {
    const branch = item.toJSON();

    return {
      ...branch,
      fullAddress: `${branch.address}, ${branch.wardName}, ${branch.districtName}, ${branch.provinceName}`,
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

const getBranchDetailService = async (data) => {
  const { branchId } = data;

  const branch = await Branch.findOne({
    where: {
      id: branchId,
      isActive: true,
    },
    attributes: [
      "id",
      "branchName",
      "address",
      "wardName",
      "districtName",
      "provinceName",
      "phoneNumber",
      "longitude",
      "latitude",
      "description",
    ],
    include: [
      {
        model: BranchImage,
        as: "images",
        attributes: ["id", "imageUrl"],
      },
      {
        model: User,
        as: "managers",
        attributes: ["email"],
        include: {
          model: Profile,
          as: "profile",
          attributes: ["fullName", "phoneNumber"],
        },
      },
    ],
  });

  if (!branch)
    throw new NotFoundError(
      "Không tìm thấy chi nhánh hoặc chi nhánh không hoạt động",
    );

  const dataBranch = branch.toJSON();

  // flatten managers
  const managers = dataBranch.managers.map((m) => ({
    email: m.email,
    fullName: m.profile?.fullName,
    phoneNumber: m.profile?.phoneNumber,
  }));

  return {
    id: dataBranch.id,
    branchName: dataBranch.branchName,
    phoneNumber: dataBranch.phoneNumber,
    description: dataBranch.description,
    longitude: dataBranch.longitude,
    latitude: dataBranch.latitude,
    fullAddress: `${dataBranch.address}, ${dataBranch.wardName}, ${dataBranch.districtName}, ${dataBranch.provinceName}, Việt Nam`,
    images: dataBranch.images,
    managers,
  };
};

const getAllBranchesService = async () => {
  const branches = await Branch.findAll({
    attributes: [
      "id",
      "branchName",
      "address",
      "wardName",
      "districtName",
      "provinceName",
    ],
  });
  return branches;
};

const branchService = {
  getBranchOptionsService,
  getPagedBranchesService,
  getBranchDetailService,
  getAllBranchesService,
};

export default branchService;
