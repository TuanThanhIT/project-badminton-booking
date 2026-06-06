# Đặc tả use case - Nhân viên

## 092 - Đăng nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 092 |
| Name | Đăng nhập |
| Goal | Cho phép nhân viên xác thực tài khoản để truy cập đúng khu vực chức năng. |
| Actors | Nhân viên |
| Pre-conditions | Không có. |
| Post-conditions | - Phiên đăng nhập được tạo thành công.<br>- Tác nhân được chuyển đến khu vực chức năng phù hợp với vai trò. |
| Main flow | 1. Nhân viên nhập thông tin đăng nhập.<br>2. Hệ thống kiểm tra thông tin tài khoản và vai trò.<br>3. Hệ thống tạo phiên đăng nhập khi thông tin hợp lệ.<br>4. Hệ thống chuyển tác nhân đến màn hình phù hợp. |
| Alternative | - Tác nhân đăng nhập bằng khu vực vai trò khác.<br>→ Hệ thống chỉ cho phép truy cập khi vai trò khớp với khu vực đăng nhập. |
| Exception | - Thông tin đăng nhập không hợp lệ.<br>→ Hệ thống từ chối đăng nhập và hiển thị thông báo lỗi.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 093 - Xem màn hình chính

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 093 |
| Name | Xem màn hình chính |
| Goal | Cho phép nhân viên xem thông tin liên quan đến chức năng xem màn hình chính. |
| Actors | Nhân viên |
| Pre-conditions | Không có. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Nhân viên mở màn hình hoặc chức năng xem màn hình chính.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 094 - Xem ca làm việc

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 094 |
| Name | Xem ca làm việc |
| Goal | Cho phép nhân viên xem thông tin liên quan đến chức năng xem ca làm việc. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Nhân viên mở màn hình hoặc chức năng xem ca làm việc.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 095 - Xem ca hiện tại

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 095 |
| Name | Xem ca hiện tại |
| Goal | Cho phép nhân viên xem thông tin liên quan đến chức năng xem ca hiện tại. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Nhân viên mở màn hình hoặc chức năng xem ca hiện tại.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 096 - Check-in ca làm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 096 |
| Name | Check-in ca làm |
| Goal | Cho phép nhân viên thực hiện chức năng check-in ca làm trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng check-in ca làm.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 097 - Check-out ca làm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 097 |
| Name | Check-out ca làm |
| Goal | Cho phép nhân viên thực hiện chức năng check-out ca làm trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng check-out ca làm.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 098 - Quản lý tiền đầu ca

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 098 |
| Name | Quản lý tiền đầu ca |
| Goal | Cho phép nhân viên quản lý dữ liệu liên quan đến chức năng quản lý tiền đầu ca. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Nhân viên mở màn hình quản lý tiền đầu ca.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Nhân viên chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 099 - Mở ca thu ngân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 099 |
| Name | Mở ca thu ngân |
| Goal | Cho phép nhân viên thực hiện chức năng mở ca thu ngân trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng mở ca thu ngân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 100 - Đóng ca thu ngân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 100 |
| Name | Đóng ca thu ngân |
| Goal | Cho phép nhân viên thực hiện chức năng đóng ca thu ngân trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng đóng ca thu ngân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 101 - Xem thông báo

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 101 |
| Name | Xem thông báo |
| Goal | Cho phép nhân viên xem thông tin liên quan đến chức năng xem thông báo. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Nhân viên mở màn hình hoặc chức năng xem thông báo.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 102 - Xem danh sách đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 102 |
| Name | Xem danh sách đặt sân |
| Goal | Cho phép nhân viên xem thông tin liên quan đến chức năng xem danh sách đặt sân. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Nhân viên mở màn hình hoặc chức năng xem danh sách đặt sân.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 103 - Xem chi tiết đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 103 |
| Name | Xem chi tiết đặt sân |
| Goal | Cho phép nhân viên xem thông tin liên quan đến chức năng xem chi tiết đặt sân. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Nhân viên mở màn hình hoặc chức năng xem chi tiết đặt sân.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 104 - Xác nhận đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 104 |
| Name | Xác nhận đặt sân |
| Goal | Cho phép nhân viên thực hiện chức năng xác nhận đặt sân trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng xác nhận đặt sân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 105 - Tiếp nhận khách đến sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 105 |
| Name | Tiếp nhận khách đến sân |
| Goal | Cho phép nhân viên thực hiện chức năng tiếp nhận khách đến sân trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng tiếp nhận khách đến sân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 106 - Hoàn tất đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 106 |
| Name | Hoàn tất đặt sân |
| Goal | Cho phép nhân viên thực hiện chức năng hoàn tất đặt sân trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng hoàn tất đặt sân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 107 - Duyệt yêu cầu hủy

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 107 |
| Name | Duyệt yêu cầu hủy |
| Goal | Cho phép nhân viên thực hiện chức năng duyệt yêu cầu hủy trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng duyệt yêu cầu hủy.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 108 - Từ chối yêu cầu hủy

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 108 |
| Name | Từ chối yêu cầu hủy |
| Goal | Cho phép nhân viên thực hiện chức năng từ chối yêu cầu hủy trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng từ chối yêu cầu hủy.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 109 - Hủy do khách vắng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 109 |
| Name | Hủy do khách vắng |
| Goal | Cho phép nhân viên thực hiện chức năng hủy do khách vắng trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng hủy do khách vắng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 110 - Xem danh sách đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 110 |
| Name | Xem danh sách đơn hàng |
| Goal | Cho phép nhân viên xem thông tin liên quan đến chức năng xem danh sách đơn hàng. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Nhân viên mở màn hình hoặc chức năng xem danh sách đơn hàng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 111 - Xem chi tiết đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 111 |
| Name | Xem chi tiết đơn hàng |
| Goal | Cho phép nhân viên xem thông tin liên quan đến chức năng xem chi tiết đơn hàng. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Nhân viên mở màn hình hoặc chức năng xem chi tiết đơn hàng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 112 - Xác nhận đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 112 |
| Name | Xác nhận đơn hàng |
| Goal | Cho phép nhân viên thực hiện chức năng xác nhận đơn hàng trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng xác nhận đơn hàng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 113 - Chuẩn bị đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 113 |
| Name | Chuẩn bị đơn hàng |
| Goal | Cho phép nhân viên thực hiện chức năng chuẩn bị đơn hàng trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng chuẩn bị đơn hàng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 114 - Bàn giao đơn cho vận chuyển

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 114 |
| Name | Bàn giao đơn cho vận chuyển |
| Goal | Cho phép nhân viên thực hiện chức năng bàn giao đơn cho vận chuyển trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng bàn giao đơn cho vận chuyển.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 115 - Cập nhật giao hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 115 |
| Name | Cập nhật giao hàng |
| Goal | Cho phép nhân viên thực hiện chức năng cập nhật giao hàng trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng cập nhật giao hàng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 116 - Duyệt hủy đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 116 |
| Name | Duyệt hủy đơn hàng |
| Goal | Cho phép nhân viên thực hiện chức năng duyệt hủy đơn hàng trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng duyệt hủy đơn hàng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 117 - Từ chối hủy đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 117 |
| Name | Từ chối hủy đơn hàng |
| Goal | Cho phép nhân viên thực hiện chức năng từ chối hủy đơn hàng trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng từ chối hủy đơn hàng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 118 - Duyệt trả hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 118 |
| Name | Duyệt trả hàng |
| Goal | Cho phép nhân viên thực hiện chức năng duyệt trả hàng trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng duyệt trả hàng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 119 - Hoàn tất trả hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 119 |
| Name | Hoàn tất trả hàng |
| Goal | Cho phép nhân viên thực hiện chức năng hoàn tất trả hàng trong hệ thống. |
| Actors | Nhân viên |
| Pre-conditions | - Nhân viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Nhân viên chọn đối tượng cần xử lý.<br>2. Nhân viên chọn chức năng hoàn tất trả hàng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 120 - Yêu cầu GHN hoàn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 120 |
| Name | Yêu cầu GHN hoàn hàng |
| Goal | Cho phép nhân viên thực hiện chức năng yêu cầu GHN hoàn hàng trong hệ thống. |
| Actors | Nhân viên, Đơn vị vận chuyển GHN |
| Pre-conditions | - Nhân viên đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Nhân viên chọn chức năng yêu cầu GHN hoàn hàng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

