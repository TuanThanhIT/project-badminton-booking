import courtService from "../../services/employee/courtService.js";

const getCourtScheduleByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    const courtSchedules = await courtService.getCourtScheduleByDateService(
      date
    );
    return res.status(200).json(courtSchedules);
  } catch (error) {
    next(error);
  }
};

const courtController = {
  getCourtScheduleByDate,
};
export default courtController;
