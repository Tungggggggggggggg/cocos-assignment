# 📚 Hệ Thống Quản Lý Thư Viện (TypeScript CLI)

Chào mừng bạn đến với **Hệ thống Quản lý Thư viện** — một ứng dụng Console/CLI chuyên nghiệp được xây dựng bằng TypeScript. Dự án áp dụng kiến trúc phân tầng (Layered Architecture) với tư duy phát triển phần mềm hiện đại như *Result Pattern*, xử lý *Bcrypt Authentication*, *Soft Delete*, cùng nghiệp vụ thư viện thực tế siêu khắt khe.

---

## 🌟 Chức Năng Nổi Bật

### 🔐 1. Xác thực & Phân quyền bảo mật (Authentication & Authorization)
- Đăng nhập an toàn với mật khẩu đã được mã hoá (hashing) thông qua thuật toán `bcryptjs`.
- Bàn phím nhập mật khẩu tự động ẩn ký tự (hiển thị `***`) sử dụng thư viện `readline-sync`.
- **Lockout Mechanism:** Khóa tạm thời hệ thống trong 15 phút nếu nhập sai mật khẩu 5 lần liên tiếp.
- Tự động điều hướng hiển thị Menu dựa trên phân quyền: `STAFF` (Thủ thư) và `STANDARD` / `PREMIUM` (Thành viên).

### 📖 2. Quản lý Đầu sách & Bản sao (Books & Copies Catalog)
- **Quản lý danh mục:** Thủ thư có quyền thêm đầu sách (Book) và nhập kho nhiều bản sao (BookCopy) thông qua tự động sinh Barcode.
- **Tính năng Soft Delete:** Xoá Đầu sách an toàn (chỉ ẩn khỏi hệ thống bằng cờ `isDeleted = true` chứ không xoá vật lý), giúp bảo toàn vẹn toàn dữ liệu Lịch sử giao dịch (Audit Logs/Loans). Không cho phép xoá nếu đang có bản sao được mượn.

### 🤝 3. Nghiệp vụ Mượn / Trả khắt khe (Circulation & Borrowing)
- Giới hạn quyền lợi mượn sách dựa theo `Hạng Thành Viên (Tier)`.
- **Chặn nợ xấu (Eager Evaluation):** Khóa quyền mượn sách mới nếu thành viên đang nắm giữ bất kỳ quyển sách nào quá hạn chưa trả, hoặc đang bị khoá thẻ (Suspended).
- **Tính tiền phạt (Fines):** Tiền phạt tự động tăng đối với trường hợp trễ hạn. Hỗ trợ hệ thống thanh toán và miễn phạt (Waive) khi có sự can thiệp của thủ thư.
- **Báo mất sách:** Thành viên dũng cảm khai báo mất sách sẽ bị phạt 1 khoản phí nhất định (150k) và tài khoản sẽ tạm dừng cho tới lúc thanh toán.

### ⏳ 4. Xử lý Đặt trước Sách Thông Minh (Reservations)
- Cho phép người dùng xếp hàng đặt sách qua mạng nếu đầu sách đã hết các bản cứng hiện hữu.
- **Cơ chế xếp hàng ưu tiên:** Khi người trước trả sách, sách sẽ bay vào trạng thái `ON_HOLD` và thông báo (`NOTIFIED`) cho người xếp hàng đầu tiên. 
- Ngăn chặn triệt để **Race Condition**: Sách đang `ON_HOLD` thì sẽ không một ai khác có thể "nẫng tay trên". 
- Hủy bỏ tự động (`Stale Expiration`) nếu quá 3 ngày sách có sẵn mà người đặt không tới mượn.

---

## 🛠 Cách Cài Đặt (Installation)

1. **Yêu cầu môi trường:** Đã cài đặt [Node.js](https://nodejs.org/en) (v18 trở lên).
2. Tải mã nguồn và trỏ Terminal về thư mục chứa dự án.
3. Chạy lệnh cài đặt các thư viện (đặc biệt là `bcryptjs` và `readline-sync`):

```bash
npm install
```

---

## 🚀 Trải Nghiệm Hệ Thống (Usage)

Khởi động ứng dụng CLI với `ts-node`:

```bash
npx ts-node src/index.ts
```

Bạn có 2 cách để bắt đầu:

### Lựa chọn 1: Đăng ký thành viên mới
- Ở màn hình "Trang Chủ", chọn phím `2. Đăng ký thành viên mới`.
- Tạo một tài khoản với tên, email và mật khẩu của bạn. Sau đó bạn có thể Đăng nhập để sử dụng các giao diện dành cho Thành viên chuẩn (STANDARD).

### Lựa chọn 2: Sử dụng Dữ Liệu Demo (Đã tích hợp sẵn)
Hệ thống đi kèm file `data/database.json` chứa thông tin test mẫu với **Mật khẩu toàn cục cho các tài khoản cũ là: `123456`**.

**Dùng thử quyền THỦ THƯ (LIBRARIAN):**
- **Email:** `khoa@gmail.com`
- **Mật khẩu:** `123456`
- *→ Từ đây bạn sẽ truy cập Menu Thủ thư để kiểm soát người dùng và dọn dẹp kho sách.*

**Dùng thử quyền THÀNH VIÊN (MEMBER):**
- **Email:** `tung@gmail.com`
- **Mật khẩu:** `123456`
- *→ Thành viên dùng Menu này để đi mượn sách, tìm kiếm và trả sách.*

---

## 🏗 Kiến Trúc Kỹ Thuật (Architecture & Tech Stack)

1. **Ngôn ngữ:** `TypeScript` với Strict Mode.
2. **Lưu trữ dữ liệu:** Flat-file JSON Storage (`database.json`), truy xuất qua thiết kế mẫu Singleton Cache (hạn chế I/O rườm rà).
3. **Cấu trúc phân tầng (Layered Architecture):**
   - **Models/Types:** Định nghĩa interfaces tinh gọn (`Book`, `Member`, `Enums`, ...).
   - **Repositories:** Chịu trách nhiệm Load, Cập nhật và Filter records từ DB.
   - **Services:** Chứa 100% Core Business Logic (`AuthService`, `BorrowingService`, `FineService`). 
   - **Controllers/UI:** Biến đổi I/O (Input/Output) giao tiếp với người dùng và chuyển hướng yêu cầu tới hệ thống Services tương ứng.
4. **Pattern An Toàn (The `Result<T>` Pattern):** Toàn bộ nghiệp vụ sử dụng `Result<T>` để gói gọi các Lỗi (Errors / Validations) thay vì ném (Throw) Exceptions lung tung, giúp luồng Code dễ bám đuổi (traceable) và không đứt gãy giữa chừng.

---