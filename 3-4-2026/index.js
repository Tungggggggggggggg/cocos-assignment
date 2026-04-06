import createSampleData from "./seeddata";
import {
    rl,
    ask,
    printLine,
    printHeader,
    menuXemTatCaSach,
    menuXemSachConSan,
    menuTimSach,
    menuThemSach,
    menuXoaSach,
    menuXemThanhVien,
    menuThemThanhVien,
    menuMuonSach,
    menuTraSach,
    menuXemSachDangMuon,
} from "./ui";

const lib = createSampleData();

async function main() {
    console.log("\n  Chào mừng đến với Hệ thống Quản lý Thư viện! 📚\n");

    while (true) {
        printHeader("MENU CHÍNH");
        console.log("  1.  Xem tất cả sách");
        console.log("  2.  Xem sách còn có thể mượn");
        console.log("  3.  Tìm kiếm sách");
        console.log("  4.  Thêm sách mới");
        console.log("  5.  Xóa sách");
        console.log("  6.  Xem danh sách thành viên");
        console.log("  7.  Đăng ký thành viên mới");
        console.log("  8.  Mượn sách");
        console.log("  9.  Trả sách");
        console.log("  10. Xem sách đang mượn của thành viên");
        console.log("  0.  Thoát");
        printLine();

        const choice = (await ask("  Chọn chức năng (0-10): ")).trim();

        switch (choice) {
            case "1":
                await menuXemTatCaSach(lib);
                break;
            case "2":
                await menuXemSachConSan(lib);
                break;
            case "3":
                await menuTimSach(lib);
                break;
            case "4":
                await menuThemSach(lib);
                break;
            case "5":
                await menuXoaSach(lib);
                break;
            case "6":
                await menuXemThanhVien(lib);
                break;
            case "7":
                await menuThemThanhVien(lib);
                break;
            case "8":
                await menuMuonSach(lib);
                break;
            case "9":
                await menuTraSach(lib);
                break;
            case "10":
                await menuXemSachDangMuon(lib);
                break;
            case "0":
                console.log("\n  Tạm biệt! 👋\n");
                rl.close();
                process.exit(0);
            default:
                console.log(
                    "\n  ⚠️  Lựa chọn không hợp lệ, vui lòng thử lại.\n",
                );
        }
    }
}

main();
