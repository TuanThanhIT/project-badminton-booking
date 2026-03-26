import { NOTFOUND } from "dns";
import { Branch, BranchImage } from "../../models/index.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
const getBranchesService = async (data) => {
  const { page = 1, limit = 10, city, district } = data;

  const offset = (page - 1) * limit;

  const where = {
    isActive: true,
  };

  // filter theo city
  if (city) {
    where.city = {
      [Op.like]: `%${city}%`,
    };
  }

  // filter theo district
  if (district) {
    where.district = {
      [Op.like]: `%${district}%`,
    };
  }

  const { rows, count } = await Branch.findAndCountAll({
    attributes: [
      "id",
      "branchName",
      "address",
      "district",
      "city",
      "phoneNumber",
    ],
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdDate", "DESC"]],
  });

  // optional: ghép full address trả về cho frontend
  const formattedRows = rows.map((item) => {
    const data = item.toJSON();
    return {
      ...data,
      fullAddress: `${data.address}, ${data.district}, ${data.city}`,
    };
  });

  return {
    data: formattedRows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
    },
  };
};
const getBranchByIdService = async (branchId) => {
  const branch = await Branch.findOne({
    where: {
      id: branchId,
      isActive: true,
    },
    attributes: [
      "id",
      "branchName",
      "address",
      "district",
      "city",
      "phoneNumber",
      "description",
      "thumbnailUrl",
    ],
    include: [
      {
        model: BranchImage,
        as: "images", // ⚠️ nhớ define association
        attributes: ["id", "imageUrl"],
      },
    ],
  });

  if (!branch)
    throw new NotFoundError(
      "Không tìm thấy chi nhánh hoặc chi nhánh không hoạt động",
    );

  const data = branch.toJSON();

  return {
    ...data,
    fullAddress: `${data.address}, ${data.district}, ${data.city}`,
  };
};
export default {
  getBranchesService,
  getBranchByIdService,
};
