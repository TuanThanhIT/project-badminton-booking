# Đặc tả use case - Quản lý chi nhánh

## 121 - Đăng nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 121 |
| Name | Đăng nhập |
| Goal | Cho phép quản lý chi nhánh xác thực tài khoản để truy cập đúng khu vực chức năng. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | Không có. |
| Post-conditions | - Phiên đăng nhập được tạo thành công.<br>- Tác nhân được chuyển đến khu vực chức năng phù hợp với vai trò. |
| Main flow | 1. Quản lý chi nhánh nhập thông tin đăng nhập.<br>2. Hệ thống kiểm tra thông tin tài khoản và vai trò.<br>3. Hệ thống tạo phiên đăng nhập khi thông tin hợp lệ.<br>4. Hệ thống chuyển tác nhân đến màn hình phù hợp. |
| Alternative | - Tác nhân đăng nhập bằng khu vực vai trò khác.<br>→ Hệ thống chỉ cho phép truy cập khi vai trò khớp với khu vực đăng nhập. |
| Exception | - Thông tin đăng nhập không hợp lệ.<br>→ Hệ thống từ chối đăng nhập và hiển thị thông báo lỗi.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 122 - Xem dashboard chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 122 |
| Name | Xem dashboard chi nhánh |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem dashboard chi nhánh. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem dashboard chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 123 - Xem thông tin chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 123 |
| Name | Xem thông tin chi nhánh |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem thông tin chi nhánh. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem thông tin chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 124 - Xem doanh thu chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 124 |
| Name | Xem doanh thu chi nhánh |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem doanh thu chi nhánh. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem doanh thu chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 125 - Xem báo cáo thống kê

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 125 |
| Name | Xem báo cáo thống kê |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem báo cáo thống kê. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem báo cáo thống kê.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 126 - Xem sản phẩm bán chạy

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 126 |
| Name | Xem sản phẩm bán chạy |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem sản phẩm bán chạy. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem sản phẩm bán chạy.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 127 - Xem đồ uống bán chạy

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 127 |
| Name | Xem đồ uống bán chạy |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem đồ uống bán chạy. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem đồ uống bán chạy.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 128 - Quản lý sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 128 |
| Name | Quản lý sân |
| Goal | Cho phép quản lý chi nhánh quản lý dữ liệu liên quan đến chức năng quản lý sân. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Quản lý chi nhánh mở màn hình quản lý sân.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Quản lý chi nhánh chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 129 - Tải ảnh sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 129 |
| Name | Tải ảnh sân |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng tải ảnh sân trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Quản lý chi nhánh chọn chức năng tải ảnh sân.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 130 - Tạo sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 130 |
| Name | Tạo sân |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng tạo sân trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng tạo sân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 131 - Cập nhật sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 131 |
| Name | Cập nhật sân |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng cập nhật sân trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng cập nhật sân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 132 - Quản lý giá sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 132 |
| Name | Quản lý giá sân |
| Goal | Cho phép quản lý chi nhánh quản lý dữ liệu liên quan đến chức năng quản lý giá sân. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Quản lý chi nhánh mở màn hình quản lý giá sân.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Quản lý chi nhánh chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 133 - Bảo trì sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 133 |
| Name | Bảo trì sân |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng bảo trì sân trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Quản lý chi nhánh chọn chức năng bảo trì sân.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 134 - Đóng sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 134 |
| Name | Đóng sân |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng đóng sân trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng đóng sân.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 135 - Xem sản phẩm chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 135 |
| Name | Xem sản phẩm chi nhánh |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem sản phẩm chi nhánh. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem sản phẩm chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 136 - Xem biến thể sản phẩm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 136 |
| Name | Xem biến thể sản phẩm |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem biến thể sản phẩm. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem biến thể sản phẩm.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 137 - Xem đồ uống chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 137 |
| Name | Xem đồ uống chi nhánh |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem đồ uống chi nhánh. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem đồ uống chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 138 - Quản lý tồn kho sản phẩm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 138 |
| Name | Quản lý tồn kho sản phẩm |
| Goal | Cho phép quản lý chi nhánh quản lý dữ liệu liên quan đến chức năng quản lý tồn kho sản phẩm. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Quản lý chi nhánh mở màn hình quản lý tồn kho sản phẩm.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Quản lý chi nhánh chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 139 - Quản lý tồn kho đồ uống

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 139 |
| Name | Quản lý tồn kho đồ uống |
| Goal | Cho phép quản lý chi nhánh quản lý dữ liệu liên quan đến chức năng quản lý tồn kho đồ uống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Quản lý chi nhánh mở màn hình quản lý tồn kho đồ uống.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Quản lý chi nhánh chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 140 - Xem lịch sử tồn kho

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 140 |
| Name | Xem lịch sử tồn kho |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem lịch sử tồn kho. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem lịch sử tồn kho.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 141 - Quản lý phiếu nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 141 |
| Name | Quản lý phiếu nhập |
| Goal | Cho phép quản lý chi nhánh quản lý dữ liệu liên quan đến chức năng quản lý phiếu nhập. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Quản lý chi nhánh mở màn hình quản lý phiếu nhập.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Quản lý chi nhánh chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 142 - Tạo phiếu nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 142 |
| Name | Tạo phiếu nhập |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng tạo phiếu nhập trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng tạo phiếu nhập.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 143 - Hủy phiếu nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 143 |
| Name | Hủy phiếu nhập |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng hủy phiếu nhập trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng hủy phiếu nhập.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 144 - Xem nhà cung cấp

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 144 |
| Name | Xem nhà cung cấp |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem nhà cung cấp. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem nhà cung cấp.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 145 - Quản lý nhân viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 145 |
| Name | Quản lý nhân viên |
| Goal | Cho phép quản lý chi nhánh quản lý dữ liệu liên quan đến chức năng quản lý nhân viên. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Quản lý chi nhánh mở màn hình quản lý nhân viên.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Quản lý chi nhánh chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 146 - Tạo nhân viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 146 |
| Name | Tạo nhân viên |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng tạo nhân viên trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng tạo nhân viên.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 147 - Gán nhân viên vào chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 147 |
| Name | Gán nhân viên vào chi nhánh |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng gán nhân viên vào chi nhánh trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng gán nhân viên vào chi nhánh.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 148 - Phân công ca làm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 148 |
| Name | Phân công ca làm |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng phân công ca làm trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Quản lý chi nhánh chọn chức năng phân công ca làm.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 149 - Tạo ca làm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 149 |
| Name | Tạo ca làm |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng tạo ca làm trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng tạo ca làm.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 150 - Gán nhân viên vào ca

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 150 |
| Name | Gán nhân viên vào ca |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng gán nhân viên vào ca trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng gán nhân viên vào ca.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 151 - Cập nhật ca làm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 151 |
| Name | Cập nhật ca làm |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng cập nhật ca làm trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng cập nhật ca làm.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 152 - Xóa ca làm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 152 |
| Name | Xóa ca làm |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng xóa ca làm trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Quản lý chi nhánh chọn đối tượng cần xử lý.<br>2. Quản lý chi nhánh chọn chức năng xóa ca làm.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 153 - Xem lương nhân viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 153 |
| Name | Xem lương nhân viên |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem lương nhân viên. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem lương nhân viên.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 154 - Theo dõi đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 154 |
| Name | Theo dõi đặt sân |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng theo dõi đặt sân. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng theo dõi đặt sân.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 155 - Xem chi tiết đặt sân

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 155 |
| Name | Xem chi tiết đặt sân |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem chi tiết đặt sân. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem chi tiết đặt sân.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 156 - Theo dõi đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 156 |
| Name | Theo dõi đơn hàng |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng theo dõi đơn hàng. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng theo dõi đơn hàng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 157 - Xem chi tiết đơn hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 157 |
| Name | Xem chi tiết đơn hàng |
| Goal | Cho phép quản lý chi nhánh xem thông tin liên quan đến chức năng xem chi tiết đơn hàng. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Quản lý chi nhánh mở màn hình hoặc chức năng xem chi tiết đơn hàng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 158 - Nhắn tin với khách hàng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 158 |
| Name | Nhắn tin với khách hàng |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng nhắn tin với khách hàng trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Quản lý chi nhánh chọn chức năng nhắn tin với khách hàng.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 159 - Quản lý hội thoại

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 159 |
| Name | Quản lý hội thoại |
| Goal | Cho phép quản lý chi nhánh quản lý dữ liệu liên quan đến chức năng quản lý hội thoại. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Quản lý chi nhánh mở màn hình quản lý hội thoại.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Quản lý chi nhánh chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 160 - Gửi tin nhắn

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 160 |
| Name | Gửi tin nhắn |
| Goal | Cho phép quản lý chi nhánh thực hiện chức năng gửi tin nhắn trong hệ thống. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Quản lý chi nhánh chọn chức năng gửi tin nhắn.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 161 - Quản lý thành viên hội thoại

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 161 |
| Name | Quản lý thành viên hội thoại |
| Goal | Cho phép quản lý chi nhánh quản lý dữ liệu liên quan đến chức năng quản lý thành viên hội thoại. |
| Actors | Quản lý chi nhánh |
| Pre-conditions | - Quản lý chi nhánh đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Quản lý chi nhánh mở màn hình quản lý thành viên hội thoại.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Quản lý chi nhánh chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

