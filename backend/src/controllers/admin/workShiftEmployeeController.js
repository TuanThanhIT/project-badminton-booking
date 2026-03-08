import workShiftEmployeeService from "../../services/admin/workShiftEmployeeService.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const assignEmployeeToShift = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result =
    await workShiftEmployeeService.assignEmployeeToShiftService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Phân công ca làm cho nhân viên thành công", result),
    );
});

const getEmployeesByShift = asyncHandler(async (req, res) => {
  const { workShiftId } = req.params;
  const data = { workShiftId };
  const result =
    await workShiftEmployeeService.getEmployeesByShiftService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách nhân viên theo ca làm thành công",
        result,
      ),
    );
});

const updateEmployeeInShift = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  const { workShiftEmployeeId } = req.params;
  const data = { workShiftEmployeeId, updateData };
  const result =
    await workShiftEmployeeService.updateEmployeeInShiftService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Cập nhật thông tin ca làm nhân viên thành công",
        result,
      ),
    );
});

const removeEmployeeFromShift = asyncHandler(async (req, res) => {
  const { workShiftEmployeeId } = req.params;
  const data = { workShiftEmployeeId };
  await workShiftEmployeeService.removeEmployeeFromShiftService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xóa nhân viên khỏi ca làm thành công"));
});

const getAllEmployeesMonthlySalary = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result =
    await workShiftEmployeeService.getAllEmployeesMonthlySalaryService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy lương tất cả nhân viên theo tháng thành công",
        result,
      ),
    );
});

const getWorkShiftEmployeeDetail = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const data = { employeeId };
  const workShiftEmployees =
    await workShiftEmployeeService.getWorkShiftEmployeeDetailService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy chi tiết ca làm của nhân viên thành công",
        workShiftEmployees,
      ),
    );
});

const workShiftEmployeeController = {
  assignEmployeeToShift,
  getEmployeesByShift,
  updateEmployeeInShift,
  removeEmployeeFromShift,
  getAllEmployeesMonthlySalary,
  getWorkShiftEmployeeDetail,
};

export default workShiftEmployeeController;
