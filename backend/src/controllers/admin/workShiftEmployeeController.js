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

const workShiftEmployeeController = {
  assignEmployeeToShift,
  getEmployeesByShift,
  updateEmployeeInShift,
  removeEmployeeFromShift,
};

export default workShiftEmployeeController;
