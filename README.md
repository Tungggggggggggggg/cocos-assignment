### **1. Command Pattern**

- **Định nghĩa chuyên sâu:** Mẫu Command đóng gói các hành động (actions) thành các đối tượng độc lập. Mô hình này cho phép tạo ra các hệ thống liên kết lỏng lẻo bằng cách tách biệt hoàn toàn đối tượng đưa ra yêu cầu (Invoker) khỏi các đối tượng thực sự xử lý yêu cầu đó (Receiver). Trong hệ thống này, các yêu cầu được gọi là các sự kiện và mã xử lý là các trình xử lý sự kiện.
- **Cơ chế hoạt động:** Thay vì thực thi logic ngay lập tức, ứng dụng sẽ tạo ra một đối tượng Command chứa toàn bộ thông tin về hành động. Các Command này có thể được đẩy vào một cấu trúc dữ liệu dạng ngăn xếp (stack). Mỗi lệnh mới được thực thi và đẩy vào ngăn xếp, và khi có yêu cầu hoàn tác, hệ thống chỉ việc lấy lệnh cuối cùng ra khỏi ngăn xếp và thực thi hành động đảo ngược.
- **Trường hợp ứng dụng thực tiễn:** Xây dựng hệ thống hoàn tác/làm lại (Undo/Redo) cho các game giải đố (Puzzle) hoặc game chiến thuật theo lượt (Turn-based Strategy).
    - Hệ thống gán phím tắt (Key binding) cho phép người chơi tự do thay đổi phím điều khiển mà không làm hỏng logic code.
    - Ghi hình và phát lại trận đấu (Replay system) bằng cách lưu lại chuỗi Command theo các mốc thời gian (timestamp).
- **Đề xuất triển khai trong Cocos Creator:** Trong dự án của bạn, để điều khiển nhân vật, hãy tạo một lớp cơ sở `Command` có hàm `execute()` và `undo()`. Khi người chơi nhấn phím "Space", thay vì gọi `player.jump()`, bạn khởi tạo `new JumpCommand(player)` và gọi `execute()`. Lệnh này có thể gọi các API tích hợp sẵn của Cocos như `cc.tween` để di chuyển node. Việc lưu lại lịch sử mảng các Command này giúp bạn dễ dàng thực hiện các cơ chế đảo ngược thời gian (như trong game Braid).

---

### **2. Flyweight Pattern**

- **Định nghĩa chuyên sâu:** Mẫu Flyweight giúp bảo tồn bộ nhớ bằng cách chia sẻ hiệu quả một số lượng lớn các đối tượng có cấu trúc nhỏ. Cốt lõi của mẫu này là việc tách biệt dữ liệu thành hai loại: Intrinsic (Dữ liệu bất biến, dùng chung) và Extrinsic (Dữ liệu thay đổi theo từng thực thể). Các đối tượng Flyweight được chia sẻ mang tính bất biến vì chúng đại diện cho các đặc điểm được dùng chung với các đối tượng khác.
- **Cơ chế hoạt động:** Hệ thống sử dụng một `FlyweightFactory` để duy trì một nhóm (pool) các đối tượng. Khi có yêu cầu tạo đối tượng, Factory sẽ kiểm tra xem đối tượng đó đã tồn tại chưa; nếu chưa, nó sẽ tạo mới và lưu trữ lại, các yêu cầu sau đó sẽ chỉ trả về đối tượng đã lưu.
- **Trường hợp ứng dụng thực tiễn:** \* Quản lý bộ nhớ cho các game "Bullet Hell" (hàng ngàn viên đạn trên màn hình).
    - Hệ thống sinh lính (Creeps/Minions) liên tục trong game Tower Defense.
    - Hệ thống Tilemap hoặc Particle System.
- **Đề xuất triển khai trong Cocos Creator:** Sự kết hợp hoàn hảo nhất cho Flyweight trong Cocos là `cc.NodePool`. Thay vì sử dụng `cc.instantiate()` liên tục (gây nghẽn CPU và kích hoạt Garbage Collector), bạn thiết lập một Pool chứa sẵn 50 viên đạn. Phần dữ liệu bất biến (SpriteFrame, kích thước Collider, sát thương cơ bản) được chia sẻ chung. Khi bắn, bạn lấy Node từ Pool ra, chỉ cập nhật dữ liệu ngoại lai (tọa độ `x, y`, vận tốc) và đưa Node trở lại Pool khi đạn bay khỏi màn hình.

---

### **3. Observer Pattern**

- **Định nghĩa chuyên sâu:** Mẫu Observer cung cấp một mô hình đăng ký (subscription), trong đó các đối tượng đăng ký lắng nghe một sự kiện và nhận được thông báo khi sự kiện đó xảy ra. Đây là nền tảng của lập trình hướng sự kiện và còn được biết đến với tên gọi Pub/Sub (Publication/Subscription).
- **Cơ chế hoạt động:** Có hai thành phần chính: Subject (đối tượng phát sự kiện) duy trì một danh sách các Observers (người lắng nghe). Khi Subject thay đổi trạng thái, nó lặp qua danh sách và gọi các hàm (event handlers) của từng Observer để thông báo.
- **Trường hợp ứng dụng thực tiễn:** Tách biệt hoàn toàn logic lõi (Core Gameplay) khỏi hệ thống Giao diện (UI) và Âm thanh (Audio).
    - Hệ thống thành tựu (Achievements) theo dõi các mốc hành động của người chơi.
- **Đề xuất triển khai trong Cocos Creator:** Khuyến nghị sử dụng một `EventEmitter` (như module `events` trong Node.js) hoặc `cc.systemEvent` (đối với Cocos 2.x). Khi nhân vật thu thập được tiền, tập lệnh nhân vật chỉ phát đi sự kiện `EventEmitter.emit('COIN_COLLECTED', {amount: 10})`. Tập lệnh `UIManager` đã đăng ký (`on('COIN_COLLECTED')`) sẽ tự động cập nhật label điểm số, và `AudioManager` sẽ phát âm thanh "ting". Điều này loại bỏ hoàn toàn việc nhân vật phải chứa tham chiếu (`reference`) trực tiếp đến UI.

---

### **4. State Pattern**

- **Định nghĩa chuyên sâu:** Mẫu State cung cấp logic đặc thù theo trạng thái cho một tập hợp giới hạn các đối tượng, trong đó mỗi đối tượng đại diện cho một trạng thái cụ thể. Máy trạng thái (State machines) thường được triển khai bằng mẫu State bằng cách hoán đổi các đối tượng trạng thái khi quá trình chuyển đổi (transition) diễn ra.
- **Cơ chế hoạt động:** Thay vì chứa một biến `string` hoặc `enum` để lưu trạng thái hiện tại, đối tượng (Context) sẽ chứa một tham chiếu đến một đối tượng `State`. Chính đối tượng `State` này sẽ quyết định quá trình chuyển đổi sang trạng thái tiếp theo.
- **Trường hợp ứng dụng thực tiễn:** Điều khiển trí tuệ nhân tạo (AI) cho quái vật (Tuần tra -> Phát hiện người chơi -> Rượt đuổi -> Tấn công -> Bỏ chạy).
    - Hệ thống Animation cho nhân vật (Idle, Run, Jump, Fall).
    - Quản lý luồng vòng lặp trò chơi (InitState -> PlayingState -> PauseState -> GameOverState).
- **Đề xuất triển khai trong Cocos Creator:** Triệt tiêu triệt để các câu lệnh `if-else` lồng nhau. Phân tách hành vi nhân vật thành các lớp `IdleState`, `RunState`, `JumpState` kế thừa từ một interface chung `IState`. Khi chuyển sang `JumpState`, class này sẽ điều khiển component `sp.Skeleton` phát hoạt ảnh nhảy. Nếu người chơi bấm nút tấn công, `JumpState` sẽ tự đánh giá xem có được phép chuyển sang `AirAttackState` hay không, giúp quy trình logic chặt chẽ và không sinh ra lỗi xung đột hoạt ảnh.

---

### **5. Singleton Pattern**

- **Định nghĩa chuyên sâu:** Mẫu Singleton giới hạn số lượng thể hiện của một đối tượng cụ thể chỉ còn đúng một thể hiện. Các Singleton rất hữu ích trong các tình huống mà các hành động trên toàn hệ thống cần được điều phối từ một trung tâm duy nhất. Nó cũng giúp hạn chế việc sử dụng biến toàn cục và giảm nguy cơ ô nhiễm không gian tên (namespace pollution).
- **Cơ chế hoạt động:** Lớp Singleton định nghĩa một phương thức `getInstance()`, phương thức này chịu trách nhiệm tạo và quản lý đối tượng thể hiện, và luôn trả về chính thể hiện duy nhất đó.
- **Trường hợp ứng dụng thực tiễn:** Quản lý các hệ thống cấp cao xuyên suốt game: `GameManager`, `AudioManager`, `NetworkManager` (kết nối máy chủ).
    - Quản lý cấu hình trò chơi (Settings) hoặc Pool kết nối cơ sở dữ liệu.
- **Đề xuất triển khai trong Cocos Creator:** Xây dựng một `GameManager` áp dụng Singleton. Để đối tượng này tồn tại khi chuyển đổi giữa các Scene (ví dụ từ MainMenu sang Level1), bạn cần kết hợp nó với API `cc.game.addPersistRootNode(node)`. Mọi tập lệnh trong dự án đều có thể gọi `GameManager.getInstance().getScore()` mà không cần phải thực hiện các truy vấn DOM đắt đỏ như `cc.find()`.

---

### **6. Phân tích Rủi ro Kiến trúc & Khuyến nghị**

Áp dụng Design Pattern không phải là "viên đạn bạc" (silver bullet). Nếu triển khai không đúng bối cảnh, hệ thống sẽ gánh chịu hậu quả nặng nề:

- **Thiết kế quá mức (Over-engineering):** Nguyên tắc YAGNI (You Aren't Gonna Need It) là cốt lõi. Áp dụng State Pattern hoặc Command Pattern cho các tính năng nguyên mẫu (prototype) quy mô nhỏ, vòng đời ngắn là một sự lãng phí tài nguyên. Nó làm tăng độ phức tạp của mã nguồn (complexity overhead) khiến các lập trình viên khác mất nhiều thời gian hơn để đọc hiểu một logic vốn có thể giải quyết bằng 2 dòng `if-else`.
- **Sự độc hại của việc lạm dụng Singleton:** Mặc dù Singleton giúp tránh biến toàn cục, nhưng lạm dụng nó sẽ tạo ra sự phụ thuộc chặt chẽ (tight coupling) ẩn giữa các class. Điều này cực kỳ nguy hiểm khi bạn muốn viết Unit Test (khó giả lập - mock data) hoặc muốn mở rộng trò chơi sang chế độ Split-screen (chia đôi màn hình cho 2 người chơi), nơi bạn đột nhiên cần 2 `GameManager` độc lập.
- **Rò rỉ bộ nhớ (Memory Leak) ở cấp độ thảm họa:** Trong Observer Pattern, vòng đời của Subject và Observer thường khác nhau. Rủi ro rò rỉ bộ nhớ (Dangling Reference) xảy ra khi một Node Observer bị hủy (`destroy()`) khỏi Cây Node (Scene Graph), nhưng hệ thống Event Emitter (Subject) vẫn giữ tham chiếu đến hàm callback của nó. Ở khung hình tiếp theo, khi Subject phát sự kiện, nó sẽ gọi vào một vùng nhớ "chết", gây sập (crash) ứng dụng. Do đó, **bắt buộc** phải sử dụng lệnh `off()` hoặc `unsubscribe()` trong hàm `onDestroy()` của mọi component Cocos Creator.
