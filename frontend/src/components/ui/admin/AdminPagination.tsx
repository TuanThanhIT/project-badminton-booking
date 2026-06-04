import TablePagination from "../user/pagination/TablePagination";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
  unit?: string;
  alwaysShow?: boolean;
};

const AdminPagination = (props: AdminPaginationProps) => (
  <TablePagination {...props} />
);

export default AdminPagination;
