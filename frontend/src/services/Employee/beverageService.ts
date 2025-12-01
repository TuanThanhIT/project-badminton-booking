import type {
  BeverageEplRequest,
  BeverageEplResponse,
} from "../../types/beverage";
import instance from "../../utils/axiosCustomize";

const getBeverages = (data: BeverageEplRequest) =>
  instance.get<BeverageEplResponse>("/employee/beverage/list", {
    params: data,
  });

const beverageService = {
  getBeverages,
};
export default beverageService;
