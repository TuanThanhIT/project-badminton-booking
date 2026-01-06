import draftService from "../../services/employee/draftService.js";

const createDraft = async (req, res, next) => {
  try {
    const { nameCustomer } = req.body;
    const employeeId = req.user.id;
    await draftService.createDraftService(employeeId, nameCustomer);
    return res
      .status(201)
      .json({ message: "Tạo đơn tạm thời cho khách hàng thành công!" });
  } catch (error) {
    next(error);
  }
};

const getDrafts = async (req, res, next) => {
  try {
    const draftBookings = await draftService.getDraftsService();
    return res.status(200).json(draftBookings);
  } catch (error) {
    next(error);
  }
};

const createAndUpdateDraft = async (req, res, next) => {
  try {
    const { draftId, total, note, courtSchedules, beverages, products } =
      req.body;
    await draftService.createAndUpdateDraftService(
      draftId,
      note,
      total,
      courtSchedules,
      beverages,
      products
    );
    return res.status(201).json({ message: "Lưu đơn tạm thời thành công" });
  } catch (error) {
    next(error);
  }
};

const getDraft = async (req, res, next) => {
  try {
    const draftId = req.params.id;
    const draftBooking = await draftService.getDraftService(draftId);
    return res.status(200).json(draftBooking);
  } catch (error) {
    next(error);
  }
};

const deleteDraft = async (req, res, next) => {
  try {
    const draftId = req.params.id;
    await draftService.deleteDraftService(draftId);
    return res.status(200).json({ message: "Xóa đơn tạm thời thành công!" });
  } catch (error) {
    next(error);
  }
};
const draftController = {
  createDraft,
  getDrafts,
  createAndUpdateDraft,
  getDraft,
  deleteDraft,
};
export default draftController;
