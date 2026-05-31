import counterService from "../../services/employee/counterService.js";

const getSession = async (req, res, next) => {
  try {
    const data = await counterService.getSessionService(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Lấy phiên làm việc hiện tại thành công!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const data = await counterService.getProductsService(
      req.user.id,
      req.query.keyword,
    );
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm tại chi nhánh thành công!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getBeverages = async (req, res, next) => {
  try {
    const data = await counterService.getBeveragesService(
      req.user.id,
      req.query.keyword,
    );
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đồ uống thành công!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getCourtBoard = async (req, res, next) => {
  try {
    const data = await counterService.getCourtBoardService(
      req.user.id,
      req.query.date,
    );
    return res.status(200).json({
      success: true,
      message: "Lấy sơ đồ sân theo chi nhánh thành công!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getDrafts = async (req, res, next) => {
  try {
    const data = await counterService.getDraftsService(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn tạm thành công!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const createDraft = async (req, res, next) => {
  try {
    const data = await counterService.createDraftService(
      req.user.id,
      req.body.nameCustomer,
      req.body.phoneNumber,
    );
    return res.status(201).json({
      success: true,
      message: "Tạo đơn tạm thành công!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateDraft = async (req, res, next) => {
  try {
    const data = await counterService.updateDraftService({
      employeeId: req.user.id,
      draftId: req.params.draftId,
      ...req.body,
    });
    return res.status(200).json({
      success: true,
      message: "Cập nhật đơn tạm thành công!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDraft = async (req, res, next) => {
  try {
    await counterService.deleteDraftService(req.user.id, req.params.draftId);
    return res.status(200).json({
      success: true,
      message: "Xoá đơn tạm thành công!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const checkoutDraft = async (req, res, next) => {
  try {
    const data = await counterService.checkoutDraftService({
      employeeId: req.user.id,
      draftId: req.params.draftId,
      paymentMethod: req.body.paymentMethod,
    });
    return res.status(200).json({
      success: true,
      message: "Hoàn tất thanh toán đơn trực tiếp thành công!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const counterController = {
  getSession,
  getProducts,
  getBeverages,
  getCourtBoard,
  getDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
  checkoutDraft,
};

export default counterController;
