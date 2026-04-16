## I. Cơ chế vận hành của Lifecycle Callbacks trong Component

Trong Cocos Creator, mỗi **Component** đều sở hữu một **Lifecycle** riêng biệt, được điều phối bởi một chuỗi các **Callback Functions**. Các hàm này được engine thực thi tự động tại các thời điểm cụ thể, cho phép nhà phát triển can thiệp vào quá trình khởi tạo, cập nhật và hủy bỏ.

Trình tự thực thi chuẩn của một Component: 

**onLoad** $\rightarrow$ **onEnable** $\rightarrow$ **start** $\rightarrow$ **update** $\rightarrow$ **lateUpdate** $\rightarrow$ **onDisable** $\rightarrow$ **onDestroy**.

### 1. Giai đoạn khởi tạo và kích hoạt (Initialization)
Quá trình bắt đầu với **onLoad**, hàm này được kích hoạt ngay khi **Node** chứa Component được khởi tạo. Đây là thời điểm quan trọng nhất để thiết lập các **Reference** giữa các Node trong **Scene** và truy xuất dữ liệu tài nguyên. 
* Đặc điểm: `onLoad` luôn chạy trước bất kỳ hàm `start` nào của các Component khác trong cùng một Scene.
* Ngay cả khi Component bị tắt (`enabled = false`), `onLoad` vẫn sẽ thực thi nếu Node đang active.

Tiếp theo là **onEnable**. Hàm này chạy khi thuộc tính `enabled` của Component chuyển từ `false` sang `true`, hoặc khi thuộc tính `active` của Node chuyển từ `false` sang `true`. Đây là nơi lý tưởng để đăng ký **Event Listener**.

Hàm **start** là bước cuối cùng trước vòng lặp cập nhật. Khác với `onLoad`, `start` là một "lời gọi trì hoãn" (deferred call), nó chỉ thực thi trước lần chạy `update` đầu tiên.

#### Bảng so sánh Lifecycle Callbacks
| Đặc điểm | onLoad | onEnable | start |
| :--- | :--- | :--- | :--- |
| **Thời điểm kích hoạt** | Ngay khi Node active lần đầu | Khi Component/Node được bật | Trước lần update đầu tiên |
| **Phụ thuộc trạng thái** | Không (vẫn gọi nếu component disable) | Có (chỉ gọi khi bật) | Có (chỉ gọi khi bật) |
| **Tần suất thực thi** | Một lần duy nhất | Mỗi khi được bật lại | Một lần duy nhất |
| **Mục đích chính** | Lấy Reference, khởi tạo dữ liệu tĩnh | Đăng ký sự kiện, reset trạng thái | Khởi tạo logic liên quan đến Component khác |

### 2. Vòng lặp cập nhật (Update Loop)
Hệ thống thực hiện các hàm cập nhật theo từng khung hình (frame):
* **update**: Chứa các logic cốt lõi (di chuyển, xử lý input), chạy trước khi **Animation** được cập nhật.
* **lateUpdate**: Chạy sau khi tất cả các thành phần xong `update` và sau các hệ thống như **Particle**, **Physics** hoặc **Animation**. Dùng để xử lý Camera follow hoặc đồng bộ vị trí cuối frame.

### 3. Giai đoạn vô hiệu hóa và giải phóng (Cleanup)
* **onDisable**: Kích hoạt khi Component/Node bị tắt, dùng để hủy đăng ký sự kiện (off event) tránh rò rỉ bộ nhớ.
* **onDestroy**: Khi phương thức `destroy()` được gọi, `onDestroy` sẽ thực thi trước khi đối tượng bị thu hồi. 

---

## II. Hệ thống Label và Overflow Modes

### 1. Mối quan hệ Font Size và Line Height
* **Font Size**: Kích thước hiển thị của ký tự.
* **Line Height**: Chiều cao của một dòng text.
* **Lưu ý**: Nếu Font Size > Line Height, text sẽ bị chồng lấn. Với **BMFont**, nếu đặt Font Size lớn hơn kích thước gốc của tài nguyên, hình ảnh sẽ bị nhòe.

### 2. Các chế độ tràn văn bản (Overflow Modes)

| Chế độ | Ảnh hưởng Bounding Box | Thay đổi Font Size | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- |
| **NONE** | Tự co giãn theo text | Không | Label ngắn, tiêu đề không giới hạn vùng |
| **CLAMP** | Cố định, cắt phần thừa | Không | Slot UI cố định kích thước |
| **SHRINK** | Cố định | Tự thu nhỏ font | Tên nhân vật, nút bấm cần vừa khung |
| **RESIZE_HEIGHT** | Tự đổi chiều cao | Không | Đoạn văn dài, nội dung chat, ScrollView |

### 3. Tự động ngắt dòng và Localization
Thuộc tính **Enable Wrap Text** cho phép text tự động xuống dòng. 
* **RESIZE_HEIGHT**: Bắt buộc phải bật ngắt dòng.
* **SHRINK**: Hệ thống ưu tiên ngắt dòng trước, sau đó mới thu nhỏ Font Size nếu vẫn vượt quá.

---

## III. Tối ưu hóa hiệu suất hiển thị (Optimization)

Cocos Creator cung cấp **Cache Mode** để quản lý Render Data:
* **NONE**: Mỗi Label tạo texture riêng. Phù hợp cho text thay đổi liên tục (Countdown).
* **BITMAP**: Vẽ vào **Dynamic Atlas**. Tối ưu cho text tĩnh.
* **CHAR**: Cache từng ký tự vào bản đồ dùng chung. Hiệu quả cho text thay đổi thường xuyên với tập ký tự hạn chế (số, đồng hồ).

#### Hạn chế của Cache Mode CHAR:
* Không hỗ trợ Overflow: `SHRINK`.
* Không hỗ trợ các style như Bold, Italic (trong một số phiên bản).
* Bản đồ ký tự có giới hạn và chỉ xóa khi chuyển **Scene**.

### Chiến lược Batching và Draw Call
Để giảm **Draw Call**, nên sử dụng **BMFont** để có thể batching cùng với các **Sprite** khác trong cùng một Atlas. Cần đảm bảo các Node cùng Z-Order và không bị xen kẽ bởi các texture khác.

---

## IV. Quy trình xử lý lỗi (Troubleshooting)

* **Resource Loading**: Lỗi 404 thường do Resource tải động (`cc.loader`) không nằm trong thư mục `resources`.
* **Preview System**: Khi Preview, engine chạy Local Server. Các lỗi cú pháp trong script có thể khiến `settings.js` không được khởi tạo chính xác.
* **Debugging**: Sử dụng Console để kiểm tra các UUID bị thiếu hoặc thông báo từ **Asset Manager**.

---

## V. Khuyến nghị và Best Practices

Việc quản lý **Lifecycle Callbacks** khoa học (dùng `onLoad` cho reference, `start` cho logic liên kết) là nền tảng cho kiến trúc bền vững. Về UI, sự kết hợp đúng đắn giữa các **Overflow Modes** của Label và kỹ thuật tối ưu hóa bộ nhớ (như dùng `CHAR` cho nhãn số thay đổi nhanh) sẽ quyết định hiệu suất mượt mà của trò chơi trên đa nền tảng.
