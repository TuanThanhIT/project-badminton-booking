import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import counterService from "../../services/employee/counterService.js";

const getSessionController = asyncHandler(async (req, res) => {
  const result = await counterService.getSessionService(req.user.id);

  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy phiên làm việc hiện tại thành công", result),
    );
});

const getProductsController = asyncHandler(async (req, res) => {
  const result = await counterService.getProductsService(
    req.user.id,
    req.query.keyword,
  );

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách sản phẩm tại chi nhánh thành công",
        result,
      ),
    );
});

const getBeveragesController = asyncHandler(async (req, res) => {
  const result = await counterService.getBeveragesService(
    req.user.id,
    req.query.keyword,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách đồ uống thành công", result));
});

const getCourtBoardController = asyncHandler(async (req, res) => {
  const result = await counterService.getCourtBoardService(
    req.user.id,
    req.query.date,
  );

  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy sơ đồ sân theo chi nhánh thành công", result),
    );
});

const getDraftsController = asyncHandler(async (req, res) => {
  const result = await counterService.getDraftsService(req.user.id);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách đơn tạm thành công", result));
});

const createDraftController = asyncHandler(async (req, res) => {
  const result = await counterService.createDraftService(
    req.user.id,
    req.body.nameCustomer,
    req.body.phoneNumber,
  );

  return res
    .status(201)
    .json(new SuccessResponse("Tạo đơn tạm thành công", result));
});

const updateDraftController = asyncHandler(async (req, res) => {
  const result = await counterService.updateDraftService({
    employeeId: req.user.id,
    draftId: req.params.draftId,
    ...req.body,
  });

  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật đơn tạm thành công", result));
});

const deleteDraftController = asyncHandler(async (req, res) => {
  await counterService.deleteDraftService(req.user.id, req.params.draftId);

  return res.status(200).json(new SuccessResponse("Xoá đơn tạm thành công"));
});

const checkoutDraftController = asyncHandler(async (req, res) => {
  const result = await counterService.checkoutDraftService({
    employeeId: req.user.id,
    draftId: req.params.draftId,
    paymentMethod: req.body.paymentMethod,
  });

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Hoàn tất thanh toán đơn trực tiếp thành công",
        result,
      ),
    );
});

const counterController = {
  getSessionController,
  getProductsController,
  getBeveragesController,
  getCourtBoardController,
  getDraftsController,
  createDraftController,
  updateDraftController,
  deleteDraftController,
  checkoutDraftController,
};

export default counterController;
