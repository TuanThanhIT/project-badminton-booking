# Đặc tả use case - Khách hàng

## 010 - Làm mới token

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 010 |
| Name | Làm mới token |
| Goal | Cho phép khách hàng thực hiện chức năng làm mới token trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng làm mới token.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 011 - Đăng xuất

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 011 |
| Name | Đăng xuất |
| Goal | Cho phép khách hàng thực hiện chức năng đăng xuất trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Phiên đăng nhập hiện tại bị kết thúc.<br>- Thông tin xác thực cục bộ được xóa khỏi giao diện. |
| Main flow | 1. Khách hàng chọn chức năng đăng xuất.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 012 - Lấy thông tin tài khoản

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 012 |
| Name | Lấy thông tin tài khoản |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng lấy thông tin tài khoản. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng lấy thông tin tài khoản.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 013 - Quản lý hồ sơ

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 013 |
| Name | Quản lý hồ sơ |
| Goal | Cho phép khách hàng quản lý dữ liệu liên quan đến chức năng quản lý hồ sơ. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Khách hàng mở màn hình quản lý hồ sơ.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Khách hàng chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 014 - Xem hồ sơ công khai

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 014 |
| Name | Xem hồ sơ công khai |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem hồ sơ công khai. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem hồ sơ công khai.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 015 - Tìm kiếm người dùng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 015 |
| Name | Tìm kiếm người dùng |
| Goal | Cho phép khách hàng thực hiện chức năng tìm kiếm người dùng trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng tìm kiếm người dùng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 016 - Quản lý địa chỉ

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 016 |
| Name | Quản lý địa chỉ |
| Goal | Cho phép khách hàng quản lý dữ liệu liên quan đến chức năng quản lý địa chỉ. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Khách hàng mở màn hình quản lý địa chỉ.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Khách hàng chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 017 - Xem thông báo

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 017 |
| Name | Xem thông báo |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem thông báo. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem thông báo.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 018 - Đánh dấu đã đọc thông báo

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 018 |
| Name | Đánh dấu đã đọc thông báo |
| Goal | Cho phép khách hàng thực hiện chức năng đánh dấu đã đọc thông báo trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng đánh dấu đã đọc thông báo.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 019 - Xem chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 019 |
| Name | Xem chi nhánh |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem chi nhánh. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 020 - Xem chi tiết chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 020 |
| Name | Xem chi tiết chi nhánh |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem chi tiết chi nhánh. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem chi tiết chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 021 - Xem sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 021 |
| Name | Xem sân |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem sân. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem sân.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 022 - Xem lịch sân và khung giờ

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 022 |
| Name | Xem lịch sân và khung giờ |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem lịch sân và khung giờ. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem lịch sân và khung giờ.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 023 - Đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 023 |
| Name | Đặt sân |
| Goal | Cho phép khách hàng thực hiện chức năng đặt sân trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng đặt sân.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 024 - Thanh toán đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 024 |
| Name | Thanh toán đặt sân |
| Goal | Cho phép khách hàng thực hiện hoặc xác nhận giao dịch thanh toán trong hệ thống. |
| Actors | Khách hàng, Cổng thanh toán VNPay |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn thao tác thanh toán.<br>2. Hệ thống kiểm tra thông tin giao dịch.<br>3. Hệ thống tạo hoặc xác nhận giao dịch thanh toán.<br>4. Hệ thống cập nhật trạng thái thanh toán và hiển thị kết quả. |
| Alternative | - Tác nhân chọn phương thức thanh toán khác nếu hệ thống hỗ trợ.<br>→ Hệ thống xử lý giao dịch theo phương thức được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Giao dịch thanh toán không thành công.<br>→ Hệ thống giữ trạng thái chưa thanh toán hoặc thông báo giao dịch thất bại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 025 - Thanh toán bằng ví

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 025 |
| Name | Thanh toán bằng ví |
| Goal | Cho phép khách hàng thực hiện hoặc xác nhận giao dịch thanh toán trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn thao tác thanh toán.<br>2. Hệ thống kiểm tra thông tin giao dịch.<br>3. Hệ thống tạo hoặc xác nhận giao dịch thanh toán.<br>4. Hệ thống cập nhật trạng thái thanh toán và hiển thị kết quả. |
| Alternative | - Tác nhân chọn phương thức thanh toán khác nếu hệ thống hỗ trợ.<br>→ Hệ thống xử lý giao dịch theo phương thức được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Giao dịch thanh toán không thành công.<br>→ Hệ thống giữ trạng thái chưa thanh toán hoặc thông báo giao dịch thất bại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 026 - Nhận callback VNPay

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 026 |
| Name | Nhận callback VNPay |
| Goal | Cho phép cổng thanh toán vnpay thực hiện hoặc xác nhận giao dịch thanh toán trong hệ thống. |
| Actors | Cổng thanh toán VNPay |
| Pre-conditions | - Cổng thanh toán VNPay đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Cổng thanh toán VNPay chọn thao tác thanh toán.<br>2. Hệ thống kiểm tra thông tin giao dịch.<br>3. Hệ thống tạo hoặc xác nhận giao dịch thanh toán.<br>4. Hệ thống cập nhật trạng thái thanh toán và hiển thị kết quả. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Giao dịch thanh toán không thành công.<br>→ Hệ thống giữ trạng thái chưa thanh toán hoặc thông báo giao dịch thất bại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 027 - Thanh toán lại bằng VNPay

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 027 |
| Name | Thanh toán lại bằng VNPay |
| Goal | Cho phép khách hàng thực hiện hoặc xác nhận giao dịch thanh toán trong hệ thống. |
| Actors | Khách hàng, Cổng thanh toán VNPay |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn thao tác thanh toán.<br>2. Hệ thống kiểm tra thông tin giao dịch.<br>3. Hệ thống tạo hoặc xác nhận giao dịch thanh toán.<br>4. Hệ thống cập nhật trạng thái thanh toán và hiển thị kết quả. |
| Alternative | - Tác nhân chọn phương thức thanh toán khác nếu hệ thống hỗ trợ.<br>→ Hệ thống xử lý giao dịch theo phương thức được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Giao dịch thanh toán không thành công.<br>→ Hệ thống giữ trạng thái chưa thanh toán hoặc thông báo giao dịch thất bại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 028 - Xem lịch sử đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 028 |
| Name | Xem lịch sử đặt sân |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem lịch sử đặt sân. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem lịch sử đặt sân.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 029 - Xem chi tiết đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 029 |
| Name | Xem chi tiết đặt sân |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem chi tiết đặt sân. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem chi tiết đặt sân.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 030 - Yêu cầu hủy đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 030 |
| Name | Yêu cầu hủy đặt sân |
| Goal | Cho phép khách hàng thực hiện chức năng yêu cầu hủy đặt sân trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng yêu cầu hủy đặt sân.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 031 - Hủy đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 031 |
| Name | Hủy đặt sân |
| Goal | Cho phép khách hàng thực hiện chức năng hủy đặt sân trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Khách hàng chọn đối tượng cần xử lý.<br>2. Khách hàng chọn chức năng hủy đặt sân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 032 - Đăng ký đặt sân theo tháng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 032 |
| Name | Đăng ký đặt sân theo tháng |
| Goal | Cho phép khách hàng thực hiện chức năng đăng ký đặt sân theo tháng trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng đăng ký đặt sân theo tháng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 033 - Thanh toán đặt sân theo tháng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 033 |
| Name | Thanh toán đặt sân theo tháng |
| Goal | Cho phép khách hàng thực hiện hoặc xác nhận giao dịch thanh toán trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn thao tác thanh toán.<br>2. Hệ thống kiểm tra thông tin giao dịch.<br>3. Hệ thống tạo hoặc xác nhận giao dịch thanh toán.<br>4. Hệ thống cập nhật trạng thái thanh toán và hiển thị kết quả. |
| Alternative | - Tác nhân chọn phương thức thanh toán khác nếu hệ thống hỗ trợ.<br>→ Hệ thống xử lý giao dịch theo phương thức được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Giao dịch thanh toán không thành công.<br>→ Hệ thống giữ trạng thái chưa thanh toán hoặc thông báo giao dịch thất bại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 034 - Xem danh mục

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 034 |
| Name | Xem danh mục |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem danh mục. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem danh mục.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 035 - Xem sản phẩm và đồ uống

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 035 |
| Name | Xem sản phẩm và đồ uống |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem sản phẩm và đồ uống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem sản phẩm và đồ uống.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 036 - Xem chi tiết sản phẩm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 036 |
| Name | Xem chi tiết sản phẩm |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem chi tiết sản phẩm. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem chi tiết sản phẩm.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 037 - Quản lý giỏ hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 037 |
| Name | Quản lý giỏ hàng |
| Goal | Cho phép khách hàng quản lý dữ liệu liên quan đến chức năng quản lý giỏ hàng. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Khách hàng mở màn hình quản lý giỏ hàng.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Khách hàng chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 038 - Tính phí vận chuyển

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 038 |
| Name | Tính phí vận chuyển |
| Goal | Cho phép khách hàng thực hiện chức năng tính phí vận chuyển trong hệ thống. |
| Actors | Khách hàng, Đơn vị vận chuyển GHN |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng tính phí vận chuyển.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 039 - Xem trước đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 039 |
| Name | Xem trước đơn hàng |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem trước đơn hàng. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem trước đơn hàng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 040 - Áp dụng mã giảm giá

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 040 |
| Name | Áp dụng mã giảm giá |
| Goal | Cho phép khách hàng thực hiện chức năng áp dụng mã giảm giá trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng áp dụng mã giảm giá.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 041 - Xóa phiên checkout

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 041 |
| Name | Xóa phiên checkout |
| Goal | Cho phép khách hàng thực hiện chức năng xóa phiên checkout trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Khách hàng chọn đối tượng cần xử lý.<br>2. Khách hàng chọn chức năng xóa phiên checkout.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 042 - Đặt hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 042 |
| Name | Đặt hàng |
| Goal | Cho phép khách hàng thực hiện chức năng đặt hàng trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng đặt hàng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 043 - Thanh toán đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 043 |
| Name | Thanh toán đơn hàng |
| Goal | Cho phép khách hàng thực hiện hoặc xác nhận giao dịch thanh toán trong hệ thống. |
| Actors | Khách hàng, Cổng thanh toán VNPay |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn thao tác thanh toán.<br>2. Hệ thống kiểm tra thông tin giao dịch.<br>3. Hệ thống tạo hoặc xác nhận giao dịch thanh toán.<br>4. Hệ thống cập nhật trạng thái thanh toán và hiển thị kết quả. |
| Alternative | - Tác nhân chọn phương thức thanh toán khác nếu hệ thống hỗ trợ.<br>→ Hệ thống xử lý giao dịch theo phương thức được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Giao dịch thanh toán không thành công.<br>→ Hệ thống giữ trạng thái chưa thanh toán hoặc thông báo giao dịch thất bại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 044 - Theo dõi đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 044 |
| Name | Theo dõi đơn hàng |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng theo dõi đơn hàng. |
| Actors | Khách hàng, Đơn vị vận chuyển GHN |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng theo dõi đơn hàng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 045 - Xem tiến trình giao hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 045 |
| Name | Xem tiến trình giao hàng |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem tiến trình giao hàng. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem tiến trình giao hàng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 046 - Xem chi tiết đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 046 |
| Name | Xem chi tiết đơn hàng |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem chi tiết đơn hàng. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem chi tiết đơn hàng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 047 - Yêu cầu hủy đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 047 |
| Name | Yêu cầu hủy đơn hàng |
| Goal | Cho phép khách hàng thực hiện chức năng yêu cầu hủy đơn hàng trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng yêu cầu hủy đơn hàng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 048 - Yêu cầu trả hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 048 |
| Name | Yêu cầu trả hàng |
| Goal | Cho phép khách hàng thực hiện chức năng yêu cầu trả hàng trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng yêu cầu trả hàng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 049 - Đánh giá sản phẩm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 049 |
| Name | Đánh giá sản phẩm |
| Goal | Cho phép khách hàng thực hiện chức năng đánh giá sản phẩm trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng đánh giá sản phẩm.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 050 - Quản lý ví

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 050 |
| Name | Quản lý ví |
| Goal | Cho phép khách hàng quản lý dữ liệu liên quan đến chức năng quản lý ví. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Khách hàng mở màn hình quản lý ví.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Khách hàng chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 051 - Nạp tiền vào ví

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 051 |
| Name | Nạp tiền vào ví |
| Goal | Cho phép khách hàng thực hiện hoặc xác nhận giao dịch thanh toán trong hệ thống. |
| Actors | Khách hàng, Cổng thanh toán VNPay |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn thao tác thanh toán.<br>2. Hệ thống kiểm tra thông tin giao dịch.<br>3. Hệ thống tạo hoặc xác nhận giao dịch thanh toán.<br>4. Hệ thống cập nhật trạng thái thanh toán và hiển thị kết quả. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Giao dịch thanh toán không thành công.<br>→ Hệ thống giữ trạng thái chưa thanh toán hoặc thông báo giao dịch thất bại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 052 - Xác nhận nạp tiền VNPay

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 052 |
| Name | Xác nhận nạp tiền VNPay |
| Goal | Cho phép cổng thanh toán vnpay thực hiện hoặc xác nhận giao dịch thanh toán trong hệ thống. |
| Actors | Cổng thanh toán VNPay |
| Pre-conditions | - Cổng thanh toán VNPay đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Cổng thanh toán VNPay chọn thao tác thanh toán.<br>2. Hệ thống kiểm tra thông tin giao dịch.<br>3. Hệ thống tạo hoặc xác nhận giao dịch thanh toán.<br>4. Hệ thống cập nhật trạng thái thanh toán và hiển thị kết quả. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Giao dịch thanh toán không thành công.<br>→ Hệ thống giữ trạng thái chưa thanh toán hoặc thông báo giao dịch thất bại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 053 - Yêu cầu rút tiền

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 053 |
| Name | Yêu cầu rút tiền |
| Goal | Cho phép khách hàng thực hiện chức năng yêu cầu rút tiền trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng yêu cầu rút tiền.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 054 - Xác thực OTP rút tiền

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 054 |
| Name | Xác thực OTP rút tiền |
| Goal | Cho phép khách hàng xác thực mã OTP để hoàn tất thao tác liên quan đến tài khoản hoặc ví. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng nhập mã OTP.<br>2. Hệ thống kiểm tra mã OTP và mục đích xác thực.<br>3. Hệ thống xác nhận thao tác nếu mã OTP hợp lệ.<br>4. Hệ thống thông báo kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Mã OTP không hợp lệ hoặc đã hết hạn.<br>→ Hệ thống yêu cầu nhập lại hoặc gửi lại OTP.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 055 - Xác nhận thanh toán bằng ví

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 055 |
| Name | Xác nhận thanh toán bằng ví |
| Goal | Cho phép khách hàng thực hiện chức năng xác nhận thanh toán bằng ví trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Khách hàng chọn đối tượng cần xử lý.<br>2. Khách hàng chọn chức năng xác nhận thanh toán bằng ví.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 056 - Xem lịch sử giao dịch

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 056 |
| Name | Xem lịch sử giao dịch |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem lịch sử giao dịch. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem lịch sử giao dịch.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 057 - Đăng bài

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 057 |
| Name | Đăng bài |
| Goal | Cho phép khách hàng thực hiện chức năng đăng bài trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng đăng bài.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 058 - Xem danh sách bài đăng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 058 |
| Name | Xem danh sách bài đăng |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem danh sách bài đăng. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem danh sách bài đăng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 059 - Xem chi tiết bài đăng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 059 |
| Name | Xem chi tiết bài đăng |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem chi tiết bài đăng. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem chi tiết bài đăng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 060 - Quản lý bài đăng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 060 |
| Name | Quản lý bài đăng |
| Goal | Cho phép khách hàng quản lý dữ liệu liên quan đến chức năng quản lý bài đăng. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Khách hàng mở màn hình quản lý bài đăng.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Khách hàng chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 061 - Bình luận

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 061 |
| Name | Bình luận |
| Goal | Cho phép khách hàng thực hiện chức năng bình luận trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng bình luận.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 062 - Thích bài đăng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 062 |
| Name | Thích bài đăng |
| Goal | Cho phép khách hàng thực hiện chức năng thích bài đăng trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng thích bài đăng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 063 - Chia sẻ bài đăng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 063 |
| Name | Chia sẻ bài đăng |
| Goal | Cho phép khách hàng thực hiện chức năng chia sẻ bài đăng trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng chia sẻ bài đăng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 064 - Nhắn tin

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 064 |
| Name | Nhắn tin |
| Goal | Cho phép khách hàng thực hiện chức năng nhắn tin trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng nhắn tin.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 065 - Quản lý nhóm chat

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 065 |
| Name | Quản lý nhóm chat |
| Goal | Cho phép khách hàng quản lý dữ liệu liên quan đến chức năng quản lý nhóm chat. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Khách hàng mở màn hình quản lý nhóm chat.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Khách hàng chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 066 - Gửi yêu cầu làm huấn luyện viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 066 |
| Name | Gửi yêu cầu làm huấn luyện viên |
| Goal | Cho phép khách hàng thực hiện chức năng gửi yêu cầu làm huấn luyện viên trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng gửi yêu cầu làm huấn luyện viên.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 067 - Tải chứng chỉ ứng tuyển

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 067 |
| Name | Tải chứng chỉ ứng tuyển |
| Goal | Cho phép khách hàng thực hiện chức năng tải chứng chỉ ứng tuyển trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng tải chứng chỉ ứng tuyển.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 068 - Xem thông tin lớp học

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 068 |
| Name | Xem thông tin lớp học |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem thông tin lớp học. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem thông tin lớp học.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 069 - Đăng ký lớp học

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 069 |
| Name | Đăng ký lớp học |
| Goal | Cho phép khách hàng thực hiện chức năng đăng ký lớp học trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách hàng chọn chức năng đăng ký lớp học.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 070 - Xem lớp đã đăng ký

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 070 |
| Name | Xem lớp đã đăng ký |
| Goal | Cho phép khách hàng xem thông tin liên quan đến chức năng xem lớp đã đăng ký. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách hàng mở màn hình hoặc chức năng xem lớp đã đăng ký.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 071 - Hủy đăng ký lớp học

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 071 |
| Name | Hủy đăng ký lớp học |
| Goal | Cho phép khách hàng thực hiện chức năng hủy đăng ký lớp học trong hệ thống. |
| Actors | Khách hàng |
| Pre-conditions | - Khách hàng đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Khách hàng chọn đối tượng cần xử lý.<br>2. Khách hàng chọn chức năng hủy đăng ký lớp học.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

