import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import userSearchService from "../../services/user/userSearchService.js";

const searchUsersController = asyncHandler(async (req, res) => {
  const data = { User: req.user, ...req.query };
  const users = await userSearchService.searchUsersByNameService(data);
  return res.status(200).json(new SuccessResponse("Tìm kiếm thành công", users));
});

const userSearchController = {
  searchUsersController,
};

export default userSearchController;
