import sequelize from "../../config/db.js";
import { Branch, Court, CourtPrice } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";

const getMyBranchService = async (managerId) => {
  const [rows] = await sequelize.query(
    `
    SELECT branchId
    FROM BranchManagers
    WHERE managerId = :managerId
    LIMIT 1
    `,
    {
      replacements: { managerId },
    },
  );

  const branchManager = rows[0];

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  const branch = await Branch.findOne({
    where: {
      id: branchManager.branchId,
    },
    include: [
      {
        model: Court,
        as: "courts",
      },
      {
        model: CourtPrice,
        as: "courtPrices",
      },
    ],
  });

  if (!branch) {
    throw new NotFoundError("Không tìm thấy chi nhánh");
  }

  return branch;
};

export default {
  getMyBranchService,
};
