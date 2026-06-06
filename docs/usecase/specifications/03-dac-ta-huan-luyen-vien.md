# Đặc tả use case - Huấn luyện viên

## 072 - Đăng nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 072 |
| Name | Đăng nhập |
| Goal | Cho phép huấn luyện viên xác thực tài khoản để truy cập đúng khu vực chức năng. |
| Actors | Huấn luyện viên |
| Pre-conditions | Không có. |
| Post-conditions | - Phiên đăng nhập được tạo thành công.<br>- Tác nhân được chuyển đến khu vực chức năng phù hợp với vai trò. |
| Main flow | 1. Huấn luyện viên nhập thông tin đăng nhập.<br>2. Hệ thống kiểm tra thông tin tài khoản và vai trò.<br>3. Hệ thống tạo phiên đăng nhập khi thông tin hợp lệ.<br>4. Hệ thống chuyển tác nhân đến màn hình phù hợp. |
| Alternative | - Tác nhân đăng nhập bằng khu vực vai trò khác.<br>→ Hệ thống chỉ cho phép truy cập khi vai trò khớp với khu vực đăng nhập. |
| Exception | - Thông tin đăng nhập không hợp lệ.<br>→ Hệ thống từ chối đăng nhập và hiển thị thông báo lỗi.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 073 - Quản lý hồ sơ

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 073 |
| Name | Quản lý hồ sơ |
| Goal | Cho phép huấn luyện viên quản lý dữ liệu liên quan đến chức năng quản lý hồ sơ. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Huấn luyện viên mở màn hình quản lý hồ sơ.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Huấn luyện viên chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 074 - Quản lý chứng chỉ

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 074 |
| Name | Quản lý chứng chỉ |
| Goal | Cho phép huấn luyện viên quản lý dữ liệu liên quan đến chức năng quản lý chứng chỉ. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Huấn luyện viên mở màn hình quản lý chứng chỉ.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Huấn luyện viên chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 075 - Tải ảnh chứng chỉ

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 075 |
| Name | Tải ảnh chứng chỉ |
| Goal | Cho phép huấn luyện viên thực hiện chức năng tải ảnh chứng chỉ trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Huấn luyện viên chọn chức năng tải ảnh chứng chỉ.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 076 - Xem thông báo

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 076 |
| Name | Xem thông báo |
| Goal | Cho phép huấn luyện viên xem thông tin liên quan đến chức năng xem thông báo. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Huấn luyện viên mở màn hình hoặc chức năng xem thông báo.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 077 - Đánh dấu thông báo đã đọc

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 077 |
| Name | Đánh dấu thông báo đã đọc |
| Goal | Cho phép huấn luyện viên thực hiện chức năng đánh dấu thông báo đã đọc trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Huấn luyện viên chọn chức năng đánh dấu thông báo đã đọc.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 078 - Xem dashboard huấn luyện

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 078 |
| Name | Xem dashboard huấn luyện |
| Goal | Cho phép huấn luyện viên xem thông tin liên quan đến chức năng xem dashboard huấn luyện. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Huấn luyện viên mở màn hình hoặc chức năng xem dashboard huấn luyện.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 079 - Đăng bài lớp học

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 079 |
| Name | Đăng bài lớp học |
| Goal | Cho phép huấn luyện viên thực hiện chức năng đăng bài lớp học trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Huấn luyện viên chọn chức năng đăng bài lớp học.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 080 - Quản lý lớp học

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 080 |
| Name | Quản lý lớp học |
| Goal | Cho phép huấn luyện viên quản lý dữ liệu liên quan đến chức năng quản lý lớp học. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Huấn luyện viên mở màn hình quản lý lớp học.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Huấn luyện viên chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 081 - Xem danh sách lớp

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 081 |
| Name | Xem danh sách lớp |
| Goal | Cho phép huấn luyện viên xem thông tin liên quan đến chức năng xem danh sách lớp. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Huấn luyện viên mở màn hình hoặc chức năng xem danh sách lớp.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 082 - Cập nhật bài lớp học

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 082 |
| Name | Cập nhật bài lớp học |
| Goal | Cho phép huấn luyện viên thực hiện chức năng cập nhật bài lớp học trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Huấn luyện viên chọn đối tượng cần xử lý.<br>2. Huấn luyện viên chọn chức năng cập nhật bài lớp học.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 083 - Cập nhật trạng thái lớp

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 083 |
| Name | Cập nhật trạng thái lớp |
| Goal | Cho phép huấn luyện viên thực hiện chức năng cập nhật trạng thái lớp trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Huấn luyện viên chọn đối tượng cần xử lý.<br>2. Huấn luyện viên chọn chức năng cập nhật trạng thái lớp.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 084 - Gửi thông báo lớp học

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 084 |
| Name | Gửi thông báo lớp học |
| Goal | Cho phép huấn luyện viên thực hiện chức năng gửi thông báo lớp học trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Huấn luyện viên chọn chức năng gửi thông báo lớp học.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 085 - Tạo hoặc mở nhóm chat lớp

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 085 |
| Name | Tạo hoặc mở nhóm chat lớp |
| Goal | Cho phép huấn luyện viên thực hiện chức năng tạo hoặc mở nhóm chat lớp trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Huấn luyện viên chọn đối tượng cần xử lý.<br>2. Huấn luyện viên chọn chức năng tạo hoặc mở nhóm chat lớp.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 086 - Xem danh sách học viên đăng ký

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 086 |
| Name | Xem danh sách học viên đăng ký |
| Goal | Cho phép huấn luyện viên xem thông tin liên quan đến chức năng xem danh sách học viên đăng ký. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Huấn luyện viên mở màn hình hoặc chức năng xem danh sách học viên đăng ký.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 087 - Xác nhận học viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 087 |
| Name | Xác nhận học viên |
| Goal | Cho phép huấn luyện viên thực hiện chức năng xác nhận học viên trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Huấn luyện viên chọn đối tượng cần xử lý.<br>2. Huấn luyện viên chọn chức năng xác nhận học viên.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 088 - Từ chối học viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 088 |
| Name | Từ chối học viên |
| Goal | Cho phép huấn luyện viên thực hiện chức năng từ chối học viên trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Huấn luyện viên chọn đối tượng cần xử lý.<br>2. Huấn luyện viên chọn chức năng từ chối học viên.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 089 - Thêm học viên thủ công

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 089 |
| Name | Thêm học viên thủ công |
| Goal | Cho phép huấn luyện viên thực hiện chức năng thêm học viên thủ công trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Huấn luyện viên chọn đối tượng cần xử lý.<br>2. Huấn luyện viên chọn chức năng thêm học viên thủ công.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 090 - Ghi chú học viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 090 |
| Name | Ghi chú học viên |
| Goal | Cho phép huấn luyện viên thực hiện chức năng ghi chú học viên trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Huấn luyện viên chọn đối tượng cần xử lý.<br>2. Huấn luyện viên chọn chức năng ghi chú học viên.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 091 - Đánh dấu hoàn thành

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 091 |
| Name | Đánh dấu hoàn thành |
| Goal | Cho phép huấn luyện viên thực hiện chức năng đánh dấu hoàn thành trong hệ thống. |
| Actors | Huấn luyện viên |
| Pre-conditions | - Huấn luyện viên đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Huấn luyện viên chọn chức năng đánh dấu hoàn thành.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

