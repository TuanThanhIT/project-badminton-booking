import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../redux/hook";
import { getCurrentEmployeeWorkShift } from "../../redux/slices/employee/workShiftSlice";

const getToday = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

const getCurrentTime = () =>
  new Date().toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

const EmployeeCashierShiftRoute = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [isActiveCashier, setIsActiveCashier] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifyShift = async () => {
      setChecked(false);

      try {
        const res = await dispatch(
          getCurrentEmployeeWorkShift({
            data: {
              date: getToday(),
              time: getCurrentTime(),
            },
          }),
        ).unwrap();

        const shift = res.data;
        if (!mounted) return;

        setIsActiveCashier(
          Boolean(
            shift &&
              shift.roleInShift === "CASHIER" &&
              shift.checkIn &&
              !shift.checkOut,
          ),
        );
      } catch {
        if (mounted) setIsActiveCashier(false);
        // global middleware handles API errors
      } finally {
        if (mounted) setChecked(true);
      }
    };

    verifyShift();

    return () => {
      mounted = false;
    };
  }, [dispatch, location.pathname]);

  useEffect(() => {
    if (!checked || isActiveCashier) return;

    toast.warning(
      "Bạn cần check-in đúng ca thu ngân trước khi truy cập màn hình xử lý.",
    );
    navigate("/employee/cash-register", {
      replace: true,
      state: { from: location.pathname },
    });
  }, [checked, isActiveCashier, location.pathname, navigate]);

  if (!checked || !isActiveCashier) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
          <span>Đang kiểm tra ca thu ngân...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default EmployeeCashierShiftRoute;
