import type { UserSearchResponse } from "../../types/userSearch";
import instance from "../../utils/axiosCustomize";

const searchUsersService = (q: string, limit = 15) =>
  instance.get<UserSearchResponse>("/user/users/search", {
    params: { q, limit },
  });

const userSearchService = {
  searchUsersService,
};

export default userSearchService;
