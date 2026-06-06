# Đặc tả use case - Khách vãng lai

## 001 - Xem trang chủ

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 001 |
| Name | Xem trang chủ |
| Goal | Cho phép khách vãng lai xem thông tin liên quan đến chức năng xem trang chủ. |
| Actors | Khách vãng lai |
| Pre-conditions | Không có. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách vãng lai mở màn hình hoặc chức năng xem trang chủ.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 002 - Xem giới thiệu và liên hệ

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 002 |
| Name | Xem giới thiệu và liên hệ |
| Goal | Cho phép khách vãng lai xem thông tin liên quan đến chức năng xem giới thiệu và liên hệ. |
| Actors | Khách vãng lai |
| Pre-conditions | Không có. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Khách vãng lai mở màn hình hoặc chức năng xem giới thiệu và liên hệ.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 003 - Đăng ký

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 003 |
| Name | Đăng ký |
| Goal | Cho phép khách vãng lai tạo tài khoản khách hàng mới trong hệ thống. |
| Actors | Khách vãng lai |
| Pre-conditions | Không có. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách vãng lai nhập thông tin đăng ký.<br>2. Hệ thống kiểm tra dữ liệu đăng ký.<br>3. Hệ thống tạo tài khoản ở trạng thái chờ xác thực.<br>4. Hệ thống gửi OTP đến email đăng ký. |
| Alternative | Không có. |
| Exception | - Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 004 - Xác thực OTP đăng ký

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 004 |
| Name | Xác thực OTP đăng ký |
| Goal | Cho phép khách vãng lai xác thực mã OTP để hoàn tất thao tác liên quan đến tài khoản hoặc ví. |
| Actors | Khách vãng lai |
| Pre-conditions | - Khách vãng lai đã gửi thông tin đăng ký.<br>- Hệ thống đã tạo hoặc có thể tạo mã OTP cho tài khoản. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách vãng lai nhập mã OTP.<br>2. Hệ thống kiểm tra mã OTP và mục đích xác thực.<br>3. Hệ thống xác nhận thao tác nếu mã OTP hợp lệ.<br>4. Hệ thống thông báo kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Mã OTP không hợp lệ hoặc đã hết hạn.<br>→ Hệ thống yêu cầu nhập lại hoặc gửi lại OTP.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 005 - Gửi lại OTP

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 005 |
| Name | Gửi lại OTP |
| Goal | Cho phép khách vãng lai xác thực mã OTP để hoàn tất thao tác liên quan đến tài khoản hoặc ví. |
| Actors | Khách vãng lai |
| Pre-conditions | - Khách vãng lai đã gửi thông tin đăng ký.<br>- Hệ thống đã tạo hoặc có thể tạo mã OTP cho tài khoản. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách vãng lai nhập mã OTP.<br>2. Hệ thống kiểm tra mã OTP và mục đích xác thực.<br>3. Hệ thống xác nhận thao tác nếu mã OTP hợp lệ.<br>4. Hệ thống thông báo kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Mã OTP không hợp lệ hoặc đã hết hạn.<br>→ Hệ thống yêu cầu nhập lại hoặc gửi lại OTP.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 006 - Đăng nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 006 |
| Name | Đăng nhập |
| Goal | Cho phép khách vãng lai xác thực tài khoản để truy cập đúng khu vực chức năng. |
| Actors | Khách vãng lai |
| Pre-conditions | Không có. |
| Post-conditions | - Phiên đăng nhập được tạo thành công.<br>- Tác nhân được chuyển đến khu vực chức năng phù hợp với vai trò. |
| Main flow | 1. Khách vãng lai nhập thông tin đăng nhập.<br>2. Hệ thống kiểm tra thông tin tài khoản và vai trò.<br>3. Hệ thống tạo phiên đăng nhập khi thông tin hợp lệ.<br>4. Hệ thống chuyển tác nhân đến màn hình phù hợp. |
| Alternative | - Tác nhân đăng nhập bằng khu vực vai trò khác.<br>→ Hệ thống chỉ cho phép truy cập khi vai trò khớp với khu vực đăng nhập. |
| Exception | - Thông tin đăng nhập không hợp lệ.<br>→ Hệ thống từ chối đăng nhập và hiển thị thông báo lỗi.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 007 - Quên mật khẩu

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 007 |
| Name | Quên mật khẩu |
| Goal | Cho phép khách vãng lai thực hiện chức năng quên mật khẩu trong hệ thống. |
| Actors | Khách vãng lai |
| Pre-conditions | Không có. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách vãng lai chọn chức năng quên mật khẩu.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 008 - Xác thực OTP đặt lại mật khẩu

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 008 |
| Name | Xác thực OTP đặt lại mật khẩu |
| Goal | Cho phép khách vãng lai xác thực mã OTP để hoàn tất thao tác liên quan đến tài khoản hoặc ví. |
| Actors | Khách vãng lai |
| Pre-conditions | - Khách vãng lai đã yêu cầu đặt lại mật khẩu.<br>- Hệ thống đã gửi mã OTP hoặc token đặt lại mật khẩu. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách vãng lai nhập mã OTP.<br>2. Hệ thống kiểm tra mã OTP và mục đích xác thực.<br>3. Hệ thống xác nhận thao tác nếu mã OTP hợp lệ.<br>4. Hệ thống thông báo kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Mã OTP không hợp lệ hoặc đã hết hạn.<br>→ Hệ thống yêu cầu nhập lại hoặc gửi lại OTP.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 009 - Đặt lại mật khẩu

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 009 |
| Name | Đặt lại mật khẩu |
| Goal | Cho phép khách vãng lai thực hiện chức năng đặt lại mật khẩu trong hệ thống. |
| Actors | Khách vãng lai |
| Pre-conditions | - Khách vãng lai đã yêu cầu đặt lại mật khẩu.<br>- Hệ thống đã gửi mã OTP hoặc token đặt lại mật khẩu. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Khách vãng lai chọn chức năng đặt lại mật khẩu.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

