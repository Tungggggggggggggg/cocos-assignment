# Hệ thống Quản lý Cửa hàng Thời trang - Tài liệu Đặc tả Hệ thống

Hệ thống Quản lý Cửa hàng Thời trang là một nền tảng tích hợp hỗ trợ vận hành TMĐT (E-commerce) và quản lý bán lẻ tại cửa hàng (POS). Hệ thống tập trung vào việc tự động hóa quy trình nghiệp vụ, đảm bảo tính chính xác của dữ liệu tồn kho và hỗ trợ báo cáo kinh doanh.

---

## 1. Tổng quan các Phân hệ Chức năng

Hệ thống được thiết kế dành cho ba nhóm đối tượng chính với các chức năng chuyên biệt:

### 1.1. Phân hệ dành cho Khách hàng (Storefront)

- **Tra cứu và Tìm kiếm:** Hiển thị danh mục sản phẩm, chi tiết sản phẩm cùng các biến thể về kích cỡ, màu sắc và số lượng khả dụng theo thời gian thực.
- **Quản lý Giỏ hàng:** Hỗ trợ lưu trữ lựa chọn sản phẩm, tự động cập nhật tổng tiền và kiểm tra tính hợp lệ của hàng hóa trước khi đặt.
- **Quy trình Đặt hàng (Checkout):**
    - Xác nhận thông tin giao hàng và phương thức thanh toán.
    - Cơ chế giữ hàng tạm thời nhằm đảm bảo ưu tiên cho người mua thực hiện giao dịch trước.
- **Theo dõi Đơn hàng:** Cung cấp thông tin chi tiết về lộ trình xử lý đơn từ lúc đặt tới khi hoàn tất.

### 1.2. Phân hệ Quản lý Kho hàng (Inventory Management)

- **Quản lý Nhập kho:** Lập phiếu nhập từ nhà cung cấp, ghi nhận số lượng và đơn giá nhập cho từng mã sản phẩm (SKU).
- **Tính toán Giá vốn:** Hệ thống áp dụng phương pháp Giá vốn Bình quân gia quyền để tự động xác định giá trị hàng tồn mỗi khi có biến động nhập kho.
- **Kiểm soát Biến động:** Ghi nhận nhật ký toàn bộ các giao dịch tăng/giảm tồn kho, hỗ trợ công tác đối soát và kiểm kê định kỳ.

### 1.3. Phân hệ Quản lý Bán hàng & Admin (Dashboard & POS)

- **Quản lý Sản phẩm:** Khởi tạo và cập nhật thông tin sản phẩm, phân loại danh mục, quản lý ảnh và các thuộc tính biến thể.
- **Bán hàng tại Quầy (POS):** Giao diện bán trực tiếp cho khách hàng tại cửa hàng, hỗ trợ in hóa đơn và trừ kho ngay lập tức.
- **Hệ thống Báo cáo:**
    - Thống kê doanh thu theo mốc thời gian.
    - Phân tích hiệu quả kinh doanh dựa trên báo cáo lợi nhuận gộp.
    - Cảnh báo các mặt hàng sắp hết hoặc có tồn kho thấp.

---

## 2. Các Quy tắc Nghiệp vụ Cốt lõi

Hệ thống vận hành dựa trên các nguyên tắc nghiệp vụ chặt chẽ:

- **Nguyên tắc Chống Bán lố (Oversell):** Hệ thống chỉ cho phép đặt hàng khi số lượng tồn kho khả dụng lớn hơn hoặc bằng lượng yêu cầu. Quy trình kiểm tra và khóa dữ liệu diễn ra đồng thời để đảm bảo tính duy nhất.
- **Nguyên tắc Giữ kho Chờ thanh toán:** Nhằm cân bằng giữa việc bán hàng trực tuyến và tại chỗ, hệ thống sẽ ưu tiên giữ hàng cho các đơn hàng đang trong quá trình thanh toán trong một khoảng thời gian quy định.
- **Nguyên tắc Kế toán:** Doanh thu và lợi nhuận được ghi nhận dựa trên dữ liệu giá vốn thực tế tại thời điểm giao dịch, đảm bảo báo cáo tài chính không bị ảnh hưởng bởi biến động giá nhập của các lô hàng sau.

---

## 3. Kiến trúc Tổng thể & Công nghệ

- **Kiến trúc:** Hệ thống sử dụng mô hình Monorepo để quản lý tập trung mã nguồn API và các ứng dụng giao diện.
- **Xử lý Dữ liệu:** Sử dụng cơ sở dữ liệu quan hệ với các ràng buộc chặt chẽ về giao dịch (Transactions) để bảo vệ tính toàn vẹn của dữ liệu.
- **Bảo mật:** Hệ thống phân quyền dựa trên vai trò (RBAC), kiểm soát truy cập từng chức năng tương ứng với vị trí nhân viên (Quản lý, Nhân viên bán hàng, Thủ kho).

---

## 4. Hướng dẫn Triển khai

1. Cài đặt các thư viện phụ thuộc bằng lệnh `npm install`.
2. Thiết lập cấu hình kết nối cơ sở dữ liệu và các biến môi trường cần thiết.
3. Khởi chạy hệ thống ở môi trường phát triển qua lệnh `npm run start:dev`.
