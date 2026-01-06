import { StatusCodes } from "http-status-codes";
import workShiftEmployeeService from "../../services/admin/workShiftEmployeeService.js";

const assignEmployeeToShift = async (req, res, next) => {
  try {
    const { workShiftId, employeeId, roleInShift } = req.body;

    const result = await workShiftEmployeeService.assignEmployeeToShiftService(
      workShiftId,
      employeeId,
      roleInShift
    );

    return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getEmployeesByShift = async (req, res, next) => {
  try {
    const { workShiftId } = req.params;

    const result = await workShiftEmployeeService.getEmployeesByShiftService(
      workShiftId
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updateEmployeeInShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await workShiftEmployeeService.updateEmployeeInShiftService(
      id,
      data
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const removeEmployeeFromShift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result =
      await workShiftEmployeeService.removeEmployeeFromShiftService(id);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllEmployeesMonthlySalary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const data =
      await workShiftEmployeeService.getAllEmployeesMonthlySalaryService(
        month,
        year
      );
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getWorkShiftEmployeeDetail = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const workShiftEmployees =
      await workShiftEmployeeService.getWorkShiftEmployeeDetailService(
        employeeId
      );
    return res.status(200).json(workShiftEmployees);
  } catch (error) {
    next(error);
  }
};

const workShiftEmployeeController = {
  assignEmployeeToShift,
  getEmployeesByShift,
  updateEmployeeInShift,
  removeEmployeeFromShift,
  getAllEmployeesMonthlySalary,
  getWorkShiftEmployeeDetail,
};

export default workShiftEmployeeController;
