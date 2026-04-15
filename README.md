## 1. Label — Overflow Mode

> Xác định hành vi khi văn bản vượt kích thước Bounding Box.

| Mode | Hành vi | Hiệu năng | Dùng khi |
|------|---------|-----------|----------|
| `NONE` | Bounding Box tự co giãn theo text | ✅ Thấp nhất | Text cố định, không giới hạn vùng |
| `CLAMP` | Cắt phần thừa; bật `EnableWrapText` để xuống dòng | ⚡ Trung bình | Text cần giới hạn vùng cứng |
| `SHRINK` | Tự thu nhỏ font để vừa khung | ❌ Cao nhất | UI linh hoạt, nút bấm đa ngôn ngữ |
| `RESIZE_HEIGHT` | Giữ nguyên chiều rộng, tự kéo dài chiều cao | ⚡ Trung bình | Danh sách, hộp chat, nội dung dài |

**⚠️ Lưu ý quan trọng:**
- `SHRINK` **không tương thích** với `CacheMode: CHAR`
- `RESIZE_HEIGHT` và `NONE` không cho phép chỉnh kích thước thủ công theo chiều bị khóa

---

## 2. Label — Cache Mode

> Quyết định cách tạo và tái sử dụng texture ký tự. Chỉ áp dụng cho **System Font** và **TTF** (BMFont đã tự tối ưu).

| Mode | Cơ chế | Dùng khi |
|------|--------|----------|
| `NONE` | Mỗi Label tạo bitmap riêng, không batch | Text thay đổi liên tục & nội dung unique (chat) |
| `BITMAP` | Đưa bitmap vào Dynamic Atlas → batch với Sprite | Text **tĩnh** hoặc ít thay đổi (tiêu đề, nút) |
| `CHAR` | Cache từng ký tự vào bản đồ dùng chung toàn cục | Text thay đổi thường, tập ký tự **hạn chế** (số, đồng hồ) |

**⚠️ Giới hạn của `CHAR`:**
- ❌ Không hỗ trợ `SHRINK`
- ❌ Không hỗ trợ `IsBold`, `IsItalic`, `IsUnderline` (v3.8+)
- ❌ Bản đồ ký tự chỉ xóa khi **chuyển cảnh** — quá nhiều ký tự unique → ký tự mới không hiển thị
- ✅ Vẫn có thể batch Draw Call giữa các Label CHAR nếu render order liên tục

**⚠️ Bug đã ghi nhận (v3.8.6):**  
`BITMAP` Label bị disable/enable lại → tạo thêm Draw Call mới thay vì tái dùng atlas. Cần kiểm thử batching sau khi build thực tế.

---

## 3. Lifecycle — Thứ tự thực thi

### Khởi tạo (chỉ chạy 1 lần)
```
onLoad → onEnable → start → update (frame 1)
```

### Vòng lặp mỗi frame
```
update → lateUpdate
```

### Tắt / Hủy
```
onDisable → onDestroy
```

---

## 4. Lifecycle — Mục đích từng hàm

| Hàm | Chạy khi | Dùng để |
|-----|----------|---------|
| `onLoad` | Node active lần đầu | Khởi tạo biến, tìm node khác, `addRef()` tài nguyên động |
| `onEnable` | Component/node bật lại | Đăng ký Event Listener, bắt đầu hiệu ứng |
| `start` | Trước `update` đầu tiên, **sau `onLoad` của tất cả component** | Logic phụ thuộc dữ liệu từ component khác |
| `update(dt)` | Mỗi frame | Di chuyển, xử lý input, đếm thời gian |
| `lateUpdate(dt)` | Sau khi tất cả `update` xong | Camera follow, sync vị trí cuối frame |
| `onDisable` | Component/node tắt | Hủy đăng ký sự kiện, dừng schedule |
| `onDestroy` | Gọi `destroy()` | `decRef()` tài nguyên, dọn dẹp bộ nhớ |

**Key insight:**
- `onLoad` ↔ `onDestroy` luôn thành cặp — engine đảm bảo nếu `onLoad` chạy thì `onDestroy` sẽ chạy
- `start` **không chạy lại** khi enable/disable, chỉ chạy đúng 1 lần

---

## 5. Quản lý tài nguyên động (Asset Manager)

```typescript
// onLoad hoặc sau khi tải xong
font.addRef();

// onDestroy — bắt buộc
font.decRef();
```

> Từ v2.4+, Cocos dùng **Reference Counting**. Quên `decRef()` → rò rỉ bộ nhớ. Quên `addRef()` → tài nguyên bị giải phóng sớm khi chuyển cảnh.

---

## 6. Ép buộc cập nhật kích thước Label ngay lập tức

Khi cần `width/height` chính xác ngay sau khi đổi `label.string`:

```typescript
// Cocos 2.x
label._updateRenderData(true);

// Cocos 3.x
label.updateRenderData(true);
```

> ⚠️ **Không gọi trong vòng lặp `update`** — chi phí rất cao, chỉ dùng khi thực sự cần (vd: căn chỉnh background theo độ dài tin nhắn).

---

## 7. Kiểm soát thứ tự thực thi

### Cùng một node
Thứ tự trong **Inspector** = thứ tự chạy (trên trước, dưới sau).

### Giữa các script khác nhau
```typescript
@ccclass('PlayerController')
@executionOrder(-1) // chạy trước các component mặc định (order = 0)
export class PlayerController extends Component { }
```
> `executionOrder` chỉ ảnh hưởng `onLoad`, `onEnable`, `start`, `update`, `lateUpdate` — **không** ảnh hưởng `onDisable`, `onDestroy`.

### Pattern khuyến nghị cho dự án lớn
Dùng **GameManager** trung tâm gọi `init()` và `tick()` thủ công thay vì phân tán logic vào từng component's lifecycle.

---

## 8. RichText — Khi nào nên tránh

- Bản chất là **tập hợp nhiều Label node con** được tạo/hủy bởi JS
- Thay đổi liên tục trong `update` → **thảm họa hiệu năng**
- Chỉ dùng khi **thực sự cần** text nhiều style (màu, size khác nhau)
- Có hỗ trợ `CacheMode: BITMAP` để giảm Draw Call

---

## 9. Quick Decision Guide

```
Hiển thị số/thời gian thay đổi nhanh?
  → TTF + CacheMode: CHAR

Tiêu đề/nhãn tĩnh?
  → TTF/System Font + CacheMode: BITMAP

Text chat, nội dung unique?
  → CacheMode: NONE

Text cần co vừa khung động?
  → Overflow: SHRINK (nhớ: không dùng CHAR)

Danh sách nội dung dài?
  → Overflow: RESIZE_HEIGHT

Cần kích thước chính xác ngay sau khi set string?
  → Gọi updateRenderData(true) một lần
```
