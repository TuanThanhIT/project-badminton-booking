# Đặc tả use case - Admin

## 162 - Đăng nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 162 |
| Name | Đăng nhập |
| Goal | Cho phép admin xác thực tài khoản để truy cập đúng khu vực chức năng. |
| Actors | Admin |
| Pre-conditions | Không có. |
| Post-conditions | - Phiên đăng nhập được tạo thành công.<br>- Tác nhân được chuyển đến khu vực chức năng phù hợp với vai trò. |
| Main flow | 1. Admin nhập thông tin đăng nhập.<br>2. Hệ thống kiểm tra thông tin tài khoản và vai trò.<br>3. Hệ thống tạo phiên đăng nhập khi thông tin hợp lệ.<br>4. Hệ thống chuyển tác nhân đến màn hình phù hợp. |
| Alternative | - Tác nhân đăng nhập bằng khu vực vai trò khác.<br>→ Hệ thống chỉ cho phép truy cập khi vai trò khớp với khu vực đăng nhập. |
| Exception | - Thông tin đăng nhập không hợp lệ.<br>→ Hệ thống từ chối đăng nhập và hiển thị thông báo lỗi.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 163 - Xem dashboard toàn hệ thống

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 163 |
| Name | Xem dashboard toàn hệ thống |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng xem dashboard toàn hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng xem dashboard toàn hệ thống.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 164 - Xem doanh thu toàn hệ thống

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 164 |
| Name | Xem doanh thu toàn hệ thống |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng xem doanh thu toàn hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng xem doanh thu toàn hệ thống.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 165 - Xem doanh thu theo chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 165 |
| Name | Xem doanh thu theo chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng xem doanh thu theo chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng xem doanh thu theo chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 166 - Xem doanh thu theo ngày tháng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 166 |
| Name | Xem doanh thu theo ngày tháng |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng xem doanh thu theo ngày tháng. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng xem doanh thu theo ngày tháng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 167 - Xem doanh thu sản phẩm và đồ uống

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 167 |
| Name | Xem doanh thu sản phẩm và đồ uống |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng xem doanh thu sản phẩm và đồ uống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng xem doanh thu sản phẩm và đồ uống.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 168 - Theo dõi tài chính

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 168 |
| Name | Theo dõi tài chính |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi tài chính. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi tài chính.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 169 - Theo dõi giao dịch ví

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 169 |
| Name | Theo dõi giao dịch ví |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi giao dịch ví. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi giao dịch ví.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 170 - Theo dõi yêu cầu rút tiền

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 170 |
| Name | Theo dõi yêu cầu rút tiền |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi yêu cầu rút tiền. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi yêu cầu rút tiền.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 171 - Duyệt yêu cầu rút tiền

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 171 |
| Name | Duyệt yêu cầu rút tiền |
| Goal | Cho phép admin thực hiện chức năng duyệt yêu cầu rút tiền trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng duyệt yêu cầu rút tiền.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 172 - Từ chối yêu cầu rút tiền

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 172 |
| Name | Từ chối yêu cầu rút tiền |
| Goal | Cho phép admin thực hiện chức năng từ chối yêu cầu rút tiền trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng từ chối yêu cầu rút tiền.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 173 - Quản lý trạng thái ví

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 173 |
| Name | Quản lý trạng thái ví |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý trạng thái ví. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Tài khoản có ví trong hệ thống. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý trạng thái ví.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 174 - Quản lý người dùng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 174 |
| Name | Quản lý người dùng |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý người dùng. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý người dùng.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 175 - Xem chi tiết người dùng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 175 |
| Name | Xem chi tiết người dùng |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng xem chi tiết người dùng. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng xem chi tiết người dùng.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 176 - Khóa hoặc mở khóa tài khoản

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 176 |
| Name | Khóa hoặc mở khóa tài khoản |
| Goal | Cho phép admin thực hiện chức năng khóa hoặc mở khóa tài khoản trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng khóa hoặc mở khóa tài khoản.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 177 - Xóa tài khoản

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 177 |
| Name | Xóa tài khoản |
| Goal | Cho phép admin thực hiện chức năng xóa tài khoản trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng xóa tài khoản.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 178 - Tạo tài khoản quản lý

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 178 |
| Name | Tạo tài khoản quản lý |
| Goal | Cho phép admin thực hiện chức năng tạo tài khoản quản lý trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng tạo tài khoản quản lý.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 179 - Quản lý tài khoản quản lý chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 179 |
| Name | Quản lý tài khoản quản lý chi nhánh |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý tài khoản quản lý chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý tài khoản quản lý chi nhánh.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 180 - Gán quản lý vào chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 180 |
| Name | Gán quản lý vào chi nhánh |
| Goal | Cho phép admin thực hiện chức năng gán quản lý vào chi nhánh trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng gán quản lý vào chi nhánh.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 181 - Thu hồi quản lý chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 181 |
| Name | Thu hồi quản lý chi nhánh |
| Goal | Cho phép admin thực hiện chức năng thu hồi quản lý chi nhánh trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng thu hồi quản lý chi nhánh.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 182 - Xem lịch sử quản lý chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 182 |
| Name | Xem lịch sử quản lý chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng xem lịch sử quản lý chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng xem lịch sử quản lý chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 183 - Cấp hoặc đổi vai trò

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 183 |
| Name | Cấp hoặc đổi vai trò |
| Goal | Cho phép admin thực hiện chức năng cấp hoặc đổi vai trò trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Admin chọn chức năng cấp hoặc đổi vai trò.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 184 - Duyệt yêu cầu huấn luyện viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 184 |
| Name | Duyệt yêu cầu huấn luyện viên |
| Goal | Cho phép admin thực hiện chức năng duyệt yêu cầu huấn luyện viên trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng duyệt yêu cầu huấn luyện viên.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 185 - Từ chối yêu cầu huấn luyện viên

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 185 |
| Name | Từ chối yêu cầu huấn luyện viên |
| Goal | Cho phép admin thực hiện chức năng từ chối yêu cầu huấn luyện viên trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng từ chối yêu cầu huấn luyện viên.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 186 - Quản lý chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 186 |
| Name | Quản lý chi nhánh |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý chi nhánh.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 187 - Tạo chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 187 |
| Name | Tạo chi nhánh |
| Goal | Cho phép admin thực hiện chức năng tạo chi nhánh trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng tạo chi nhánh.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 188 - Cập nhật chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 188 |
| Name | Cập nhật chi nhánh |
| Goal | Cho phép admin thực hiện chức năng cập nhật chi nhánh trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng cập nhật chi nhánh.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 189 - Khóa hoặc mở chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 189 |
| Name | Khóa hoặc mở chi nhánh |
| Goal | Cho phép admin thực hiện chức năng khóa hoặc mở chi nhánh trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng khóa hoặc mở chi nhánh.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 190 - Theo dõi chi tiết chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 190 |
| Name | Theo dõi chi tiết chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi chi tiết chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Bản ghi cần xem chi tiết tồn tại trong hệ thống. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi chi tiết chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 191 - Theo dõi sân chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 191 |
| Name | Theo dõi sân chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi sân chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi sân chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 192 - Theo dõi nhân viên chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 192 |
| Name | Theo dõi nhân viên chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi nhân viên chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi nhân viên chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 193 - Theo dõi đặt sân chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 193 |
| Name | Theo dõi đặt sân chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi đặt sân chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi đặt sân chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 194 - Theo dõi đơn hàng chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 194 |
| Name | Theo dõi đơn hàng chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi đơn hàng chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi đơn hàng chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 195 - Theo dõi tồn kho chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 195 |
| Name | Theo dõi tồn kho chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi tồn kho chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi tồn kho chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 196 - Theo dõi phiếu nhập chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 196 |
| Name | Theo dõi phiếu nhập chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi phiếu nhập chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi phiếu nhập chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 197 - Theo dõi doanh thu chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 197 |
| Name | Theo dõi doanh thu chi nhánh |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi doanh thu chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi doanh thu chi nhánh.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 198 - Quản lý hình ảnh chi nhánh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 198 |
| Name | Quản lý hình ảnh chi nhánh |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý hình ảnh chi nhánh. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý hình ảnh chi nhánh.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 199 - Quản lý danh mục

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 199 |
| Name | Quản lý danh mục |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý danh mục. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý danh mục.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 200 - Quản lý sản phẩm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 200 |
| Name | Quản lý sản phẩm |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý sản phẩm. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý sản phẩm.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 201 - Quản lý hình ảnh sản phẩm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 201 |
| Name | Quản lý hình ảnh sản phẩm |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý hình ảnh sản phẩm. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý hình ảnh sản phẩm.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 202 - Quản lý biến thể sản phẩm

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 202 |
| Name | Quản lý biến thể sản phẩm |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý biến thể sản phẩm. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý biến thể sản phẩm.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 203 - Quản lý đồ uống

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 203 |
| Name | Quản lý đồ uống |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý đồ uống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý đồ uống.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 204 - Xem tồn đồ uống

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 204 |
| Name | Xem tồn đồ uống |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng xem tồn đồ uống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng xem tồn đồ uống.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 205 - Quản lý mã giảm giá

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 205 |
| Name | Quản lý mã giảm giá |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý mã giảm giá. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý mã giảm giá.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân chỉ xem danh sách mà không thực hiện thay đổi.<br>→ Hệ thống giữ nguyên dữ liệu hiện tại. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 206 - Bật hoặc tắt mã giảm giá

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 206 |
| Name | Bật hoặc tắt mã giảm giá |
| Goal | Cho phép admin thực hiện chức năng bật hoặc tắt mã giảm giá trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng bật hoặc tắt mã giảm giá.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 207 - Quản lý nhà cung cấp

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 207 |
| Name | Quản lý nhà cung cấp |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý nhà cung cấp. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý nhà cung cấp.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 208 - Duyệt phiếu nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 208 |
| Name | Duyệt phiếu nhập |
| Goal | Cho phép admin thực hiện chức năng duyệt phiếu nhập trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng duyệt phiếu nhập.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 209 - Từ chối phiếu nhập

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 209 |
| Name | Từ chối phiếu nhập |
| Goal | Cho phép admin thực hiện chức năng từ chối phiếu nhập trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng từ chối phiếu nhập.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 210 - Theo dõi tồn kho

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 210 |
| Name | Theo dõi tồn kho |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi tồn kho. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi tồn kho.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 211 - Theo dõi lịch sử nhập xuất

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 211 |
| Name | Theo dõi lịch sử nhập xuất |
| Goal | Cho phép admin xem thông tin liên quan đến chức năng theo dõi lịch sử nhập xuất. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin yêu cầu được hiển thị.<br>- Dữ liệu trong hệ thống không bị thay đổi. |
| Main flow | 1. Admin mở màn hình hoặc chức năng theo dõi lịch sử nhập xuất.<br>2. Hệ thống kiểm tra điều kiện truy cập nếu chức năng yêu cầu đăng nhập.<br>3. Hệ thống lấy dữ liệu phù hợp với phạm vi quyền của tác nhân.<br>4. Hệ thống hiển thị dữ liệu cho tác nhân. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 212 - Quản lý bài đăng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 212 |
| Name | Quản lý bài đăng |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý bài đăng. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý bài đăng.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 213 - Ẩn hoặc hiện bài đăng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 213 |
| Name | Ẩn hoặc hiện bài đăng |
| Goal | Cho phép admin thực hiện chức năng ẩn hoặc hiện bài đăng trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng ẩn hoặc hiện bài đăng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 214 - Xóa bài đăng

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 214 |
| Name | Xóa bài đăng |
| Goal | Cho phép admin thực hiện chức năng xóa bài đăng trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng xóa bài đăng.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 215 - Quản lý bình luận

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 215 |
| Name | Quản lý bình luận |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý bình luận. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý bình luận.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 216 - Xóa bình luận

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 216 |
| Name | Xóa bình luận |
| Goal | Cho phép admin thực hiện chức năng xóa bình luận trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng xóa bình luận.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 217 - Quản lý phản hồi

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 217 |
| Name | Quản lý phản hồi |
| Goal | Cho phép admin quản lý dữ liệu liên quan đến chức năng quản lý phản hồi. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Thông tin được hiển thị hoặc cập nhật theo thao tác được chọn. |
| Main flow | 1. Admin mở màn hình quản lý phản hồi.<br>2. Hệ thống hiển thị dữ liệu hiện có.<br>3. Admin chọn thao tác xem, thêm, sửa, xóa hoặc cập nhật nếu được hỗ trợ.<br>4. Hệ thống kiểm tra dữ liệu và quyền thao tác.<br>5. Hệ thống lưu thay đổi hoặc hiển thị kết quả xử lý. |
| Alternative | - Tác nhân thay đổi bộ lọc, từ khóa tìm kiếm hoặc phân trang nếu màn hình hỗ trợ.<br>→ Hệ thống hiển thị lại dữ liệu phù hợp với điều kiện được chọn. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 218 - Xóa phản hồi

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 218 |
| Name | Xóa phản hồi |
| Goal | Cho phép admin thực hiện chức năng xóa phản hồi trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công.<br>- Đối tượng cần xử lý tồn tại và đang ở trạng thái cho phép thao tác. |
| Post-conditions | - Trạng thái hoặc dữ liệu của đối tượng được cập nhật thành công.<br>- Hệ thống lưu lại kết quả xử lý. |
| Main flow | 1. Admin chọn đối tượng cần xử lý.<br>2. Admin chọn chức năng xóa phản hồi.<br>3. Hệ thống kiểm tra trạng thái hiện tại và quyền thao tác.<br>4. Hệ thống cập nhật dữ liệu khi điều kiện hợp lệ.<br>5. Hệ thống hiển thị kết quả xử lý. |
| Alternative | - Đối tượng không ở trạng thái phù hợp để xử lý.<br>→ Hệ thống không cập nhật trạng thái và thông báo thao tác không hợp lệ. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

## 219 - Tải lên hình ảnh

| Thuộc tính | Nội dung |
| --- | --- |
| Use Case ID | 219 |
| Name | Tải lên hình ảnh |
| Goal | Cho phép admin thực hiện chức năng tải lên hình ảnh trong hệ thống. |
| Actors | Admin |
| Pre-conditions | - Admin đã đăng nhập thành công. |
| Post-conditions | - Use case được thực hiện thành công.<br>- Hệ thống cập nhật hoặc hiển thị kết quả tương ứng. |
| Main flow | 1. Admin chọn chức năng tải lên hình ảnh.<br>2. Hệ thống kiểm tra điều kiện thực hiện.<br>3. Hệ thống xử lý dữ liệu theo chức năng đã chọn.<br>4. Hệ thống hiển thị kết quả cho tác nhân. |
| Alternative | Không có. |
| Exception | - Phiên đăng nhập không hợp lệ.<br>→ Hệ thống yêu cầu đăng nhập lại.<br><br>- Không xử lý được dữ liệu do lỗi hệ thống.<br>→ Hệ thống hiển thị thông báo “Hệ thống đang bị lỗi, vui lòng thử lại sau!”. |

