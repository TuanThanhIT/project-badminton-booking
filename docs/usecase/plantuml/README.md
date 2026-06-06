# PlantUML use case diagrams

Thư mục này chứa bộ lược đồ use case PlantUML cho mục 3.5. Các file được tạo từ chức năng có trong source code hiện tại, gồm backend routes/controllers/services, frontend routes/pages/sidebar/service API, middleware phân quyền và role constants.

## Các chức năng đã bổ sung so với yêu cầu gốc

Yêu cầu gốc đã liệt kê khá đầy đủ, nhưng khi đối chiếu source code còn thiếu hoặc chưa nêu rõ các nhóm sau:

| Nhóm | Chức năng bổ sung | Căn cứ source |
| --- | --- | --- |
| Khách vãng lai | Xem trang chủ, giới thiệu, liên hệ | `frontend/src/routes/UserRoute.tsx`, `backend/src/routes/user/homeRoute.js` |
| Tài khoản | Đăng ký, xác thực OTP, gửi lại OTP, quên mật khẩu, xác thực OTP reset, đặt lại mật khẩu, refresh token, logout, get account | `backend/src/routes/user/authRoute.js`, `backend/src/services/user/authService.js` |
| Khách hàng | Xem hồ sơ công khai, tìm kiếm người dùng | `backend/src/routes/user/profileRoute.js`, `userSearchRoute.js`, `frontend/src/pages/user/PublicProfilePage.tsx` |
| Đặt sân | Thanh toán lại VNPay, callback VNPay, hủy trực tiếp, thanh toán đặt sân theo tháng | `backend/src/routes/user/bookingRoute.js`, `monthlyBookingRoute.js` |
| Mua hàng | Danh mục, tính phí vận chuyển, xóa phiên checkout, callback VNPay, retry VNPay, tiến trình giao hàng, đánh giá sản phẩm | `backend/src/routes/user/orderRoute.js`, `cateRoute.js`, `feedbackRoute.js` |
| Ví | Xác thực OTP rút tiền, xác nhận thanh toán bằng ví | `backend/src/routes/user/walletRoute.js`, `backend/src/constants/userConstant.js` |
| Cộng đồng | Xem danh sách/chi tiết bài đăng, nhóm chat, tải chứng chỉ ứng tuyển coach | `backend/src/routes/user/postRoute.js`, `conversationRoute.js`, `coachApplicationRoute.js` |
| Coach | Tải ảnh chứng chỉ, cập nhật bài lớp học, ghi chú học viên | `backend/src/routes/user/profileRoute.js`, `postRoute.js`, `coachClassRoute.js` |
| Nhân viên | Check-in/check-out, mở/đóng ca thu ngân, duyệt/từ chối hủy đặt sân, hoàn tất trả hàng | `backend/src/routes/employee/workShiftRoute.js`, `counterRoute.js`, `bookingRoute.js`, `orderRoute.js` |
| Quản lý | Biến thể sản phẩm, lịch sử tồn kho, tạo/hủy phiếu nhập, gán nhân viên vào chi nhánh/ca | `backend/src/routes/manager/productRoute.js`, `inventoryRoute.js`, `purchaseReceiptRoute.js`, `employeeRoute.js`, `workShiftRoute.js` |
| Admin | Duyệt/từ chối rút tiền, trạng thái ví, lịch sử quản lý chi nhánh, theo dõi chi nhánh theo tab, lịch sử nhập xuất | `backend/src/routes/admin/financeRoute.js`, `managerRoute.js`, `branchRoute.js`, `inventoryRoute.js` |

## Danh sách file

| File | Mô tả |
| --- | --- |
| `01-usecase-tong-quat.puml` | Use case tổng quát hệ thống |
| `02-khach-hang-tai-khoan.puml` | Khách hàng: tài khoản, hồ sơ, địa chỉ, thông báo |
| `03-khach-hang-dat-san.puml` | Khách hàng: chi nhánh, sân, đặt sân, thanh toán, hủy |
| `04-khach-hang-mua-hang.puml` | Khách hàng: sản phẩm, giỏ hàng, checkout, đơn hàng |
| `05-khach-hang-vi-giao-dich.puml` | Khách hàng: ví, nạp/rút tiền, giao dịch |
| `06-khach-hang-cong-dong-huan-luyen.puml` | Khách hàng: bài đăng, nhắn tin, ứng tuyển coach, lớp học |
| `07-huan-luyen-vien-tai-khoan.puml` | Coach: hồ sơ, chứng chỉ, dashboard |
| `08-huan-luyen-vien-quan-ly-lop.puml` | Coach: quản lý lớp học |
| `09-huan-luyen-vien-quan-ly-hoc-vien.puml` | Coach: quản lý học viên |
| `10-nhan-vien-ca-lam.puml` | Nhân viên: ca làm và tiền đầu ca |
| `11-nhan-vien-xu-ly-dat-san.puml` | Nhân viên: xử lý đặt sân |
| `12-nhan-vien-xu-ly-don-hang.puml` | Nhân viên: xử lý đơn hàng |
| `13-quan-ly-tong-quan-bao-cao.puml` | Manager: tổng quan và báo cáo |
| `14-quan-ly-san.puml` | Manager: quản lý sân và giá sân |
| `15-quan-ly-hang-hoa-kho.puml` | Manager: hàng hóa, tồn kho, nhập hàng |
| `16-quan-ly-nhan-su.puml` | Manager: nhân viên, phân ca, lương |
| `17-quan-ly-theo-doi-hoat-dong.puml` | Manager: theo dõi booking/order và nhắn tin |
| `18-admin-tong-quan-tai-chinh.puml` | Admin: dashboard, doanh thu, tài chính |
| `19-admin-nguoi-dung-phan-quyen.puml` | Admin: user, manager, role, coach application |
| `20-admin-chi-nhanh.puml` | Admin: chi nhánh và theo dõi chi tiết |
| `21-admin-hang-hoa-kho.puml` | Admin: danh mục, sản phẩm, đồ uống, kho |
| `22-admin-noi-dung.puml` | Admin: bài đăng, bình luận, feedback, upload |

## Ánh xạ role

| Source role | Actor |
| --- | --- |
| Chưa đăng nhập | Khách vãng lai |
| `USER` | Khách hàng |
| `COACH` | Huấn luyện viên |
| `EMPLOYEE` | Nhân viên |
| `MANAGER` | Quản lý chi nhánh |
| `ADMIN` | Admin |

## Cách xem bằng VS Code

1. Cài extension PlantUML.
2. Mở một file `.puml`.
3. Dùng lệnh `PlantUML: Preview Current Diagram`.

## Xuất SVG hoặc PNG

Nếu đã cài PlantUML CLI:

```bash
plantuml -tsvg docs/usecase/plantuml/*.puml
plantuml -tpng docs/usecase/plantuml/*.puml
```

## Chức năng chưa hoàn thiện hoặc chưa xác định rõ

| Chức năng | Ghi chú |
| --- | --- |
| Khách vãng lai xem chi nhánh/sân/sản phẩm/bài đăng | Frontend đặt các trang này sau `UserProtectedRoute`, nhiều API tương ứng cũng yêu cầu auth |
| Lịch rảnh/lịch hướng dẫn riêng của coach | Source có module lớp học/học viên, chưa thấy route/page lịch riêng |
| Nhân viên quản lý kho/sản phẩm/nhập hàng | Không có route employee tương ứng; chức năng nằm ở manager/admin |
| Manager quản lý mã giảm giá | Chưa thấy route/page manager discount |
| Manager quản lý huấn luyện viên theo chi nhánh | Chưa thấy route/page manager coach |
| Admin cấu hình hệ thống | Chưa thấy route/controller/service/page cấu hình riêng |
| Admin báo cáo vi phạm riêng | Chưa thấy model/route report violation riêng; chỉ có quản lý bài đăng, bình luận, feedback |

