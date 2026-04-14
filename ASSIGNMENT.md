### CÂU 1: ATLAS (SPRITE SHEET)

#### 1. Định Nghĩa

Atlas (hay còn gọi là Sprite Sheet) là kỹ thuật gộp nhiều hình ảnh nhỏ lại thành một texture lớn duy nhất. Thay vì GPU phải load từng ảnh riêng lẻ, nó chỉ cần load một texture duy nhất rồi cắt ra phần cần dùng theo tọa độ được ghi trong file chỉ mục.

> 💡 **Tại sao cần Atlas?**
> Mỗi lần GPU đổi texture (texture switch), CPU phải gửi thêm một DrawCall. Trong game có hàng trăm sprites, điều này có thể khiến game bị giật, tụt FPS nghiêm trọng. Atlas giúp gộp các texture cùng loại lại, giúp GPU vẽ nhiều sprites chỉ trong một DrawCall duy nhất.

#### 2. Thành Phần Của Một Atlas

Một bộ Atlas tiêu chuẩn bao gồm hai tệp đi kèm:

| Tệp              | Phần mở rộng | Nội dung                                                              | Vai trò                         |
| :--------------- | :----------- | :-------------------------------------------------------------------- | :------------------------------ |
| **Hình ảnh gộp** | .png         | Tất cả sprites được sắp xếp sát nhau, đã cắt bỏ vùng trắng (trimming) | Texture thực tế nạp lên GPU     |
| **Tệp chỉ mục**  | .plist       | Tọa độ (x, y), kích thước (w, h), tên từng sprite con                 | Hướng dẫn cắt sprite từ texture |

#### 3. Các Loại Atlas Trong Cocos Creator

##### 3.1 Static Atlas – Atlas Tĩnh

- **Khái niệm:** Được tạo bằng công cụ bên ngoài (TexturePacker, Shoebox…) trước khi đưa vào dự án.
- **Cách tích hợp:** Export 2 file (.png và .plist), kéo vào thư mục `assets/`.
- **Sử dụng trong code:**
    ```typescript
    // Load một SpriteFrame từ Atlas tĩnh
    const spriteFrame = resources.get("sprites/hero_idle_0", SpriteFrame);
    this.getComponent(Sprite).spriteFrame = spriteFrame;
    ```
- **Nên dùng khi:** Muốn kiểm soát hoàn toàn việc sắp xếp; dự án đa nền tảng; hoặc team có artist quen dùng tool ngoài.

##### 3.2 Auto Atlas – Atlas Tự Động

- **Khái niệm:** Tính năng tích hợp của Cocos. Dev dùng ảnh rời, Cocos tự gộp khi Build.
- **Cách tạo:** Chuột phải thư mục → Create → Auto Atlas (tạo file `.pac`).
- **Lưu ý:** Chỉ gộp khi Build. Trong Editor vẫn hiển thị rời lẻ.
- **Sử dụng trong code:** Giống Static Atlas, Cocos tự động redirect sau khi Build.

##### 3.3 Dynamic Atlas – Atlas Động

- **Khái niệm:** Hệ thống tự gộp các texture nhỏ (< 512x512 px) ngay khi game đang chạy.
- **Cách bật/tắt:**
    ```typescript
    dynamicAtlasManager.enabled = true; // Bật toàn cục
    sprite.spriteFrame.packable = false; // Tắt cho sprite cụ thể
    ```

#### 4. So Sánh Các Loại Atlas

| Tiêu chí          | Static Atlas          | Auto Atlas                  | Dynamic Atlas           |
| :---------------- | :-------------------- | :-------------------------- | :---------------------- |
| **Thời điểm tạo** | Trước project         | Lúc Build                   | Lúc đang chạy (Runtime) |
| **Kiểm soát**     | Cao nhất              | Trung bình                  | Thấp (Tự động)          |
| **Phù hợp cho**   | Asset ổn định         | Asset thay đổi thường xuyên | Asset load động         |
| **Yêu cầu tool**  | Có (TexturePacker...) | Không                       | Không                   |

#### 5. Giới Hạn & Lỗi Thường Gặp

1.  **Vượt giới hạn texture:** Mobile thường hỗ trợ tối đa 2048x2048 px.
2.  **Không đồng bộ:** Quên export lại `.plist` sau khi sửa ảnh dẫn đến sai tọa độ.
3.  **Trộn lẫn atlas:** Dùng sprite từ nhiều atlas khác nhau trong cùng một Node làm tăng DrawCall.

---

### CÂU 2: HỆ TỌA ĐỘ TRONG COCOS CREATOR

#### 1. Tổng Quan

Cocos Creator dùng hệ tọa độ **Cartesian thuận (Right-handed)**.

- **Cocos 2.x:** Gốc (0,0) ở góc dưới bên trái màn hình.
- **Cocos 3.x:** Gốc Canvas mặc định ở **GIỮA** màn hình (do Anchor Point là 0.5, 0.5).

#### 2. Hệ Tọa Độ Thế Giới (World Coordinate)

Hệ tọa độ cố định cho toàn bộ Scene. Các trục: X (phải), Y (lên), Z (người xem).

- **Lấy/Đặt tọa độ:**
    ```typescript
    const worldPos = this.node.getWorldPosition();
    this.node.setWorldPosition(new Vec3(100, 200, 0));
    ```

#### 3. Hệ Tọa Độ Cục Bộ (Local / Node Coordinate)

Tọa độ của Node con tính tương đối so với Node cha. Di chuyển cha thì con đi theo nhưng Local Position không đổi. Cực kỳ hữu ích cho các vật thể có nhiều bộ phận.

#### 4. Điểm Neo (Anchor Point)

Xác định điểm gốc của Node so với hình ảnh của nó.

| Giá trị Anchor | Vị trí điểm gốc   | Ứng dụng               |
| :------------- | :---------------- | :--------------------- |
| (0.5, 0.5)     | Giữa node         | Mặc định               |
| (0, 0)         | Góc dưới bên trái | Thanh máu (HP bar)     |
| (0.5, 0)       | Cạnh dưới giữa    | Nhân vật đứng trên nền |

**Ví dụ Thanh máu (HP Bar):**
Dùng Anchor (0, 0.5) để thanh máu co từ phải sang trái một cách tự nhiên khi giảm chiều rộng.

#### 5. Chuyển Đổi Hệ Tọa Độ

- `convertToNodeSpaceAR()`: World → Local (Xử lý touch/click).
- `convertToWorldSpaceAR()`: Local → World (Hiện hiệu ứng tại vị trí node con).

**Xử lý Touch Input ví dụ:**

```typescript
onTouch(event: EventTouch) {
    const worldPos = event.getUILocation();
    const localPos = this.gameBoard.convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
    // Tính toán ô bàn cờ dựa trên localPos...
}
```

#### 6. Lưu Ý Đặc Biệt Với UI Canvas (3.x)

Trong Cocos 3.x, do gốc ở giữa màn hình, tọa độ góc dưới bên trái (màn hình 720x1280) sẽ là (-360, -640).

> 💡 **Mẹo:** Luôn dùng **Widget Component** thay vì hardcode tọa độ để UI tự thích ứng với mọi kích thước màn hình.
