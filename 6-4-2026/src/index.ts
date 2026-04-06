import { ConsoleApp } from "./ui/ConsoleApp";

const app = new ConsoleApp();

process.on("SIGINT", () => {
    console.log("\n  Thoát chương trình... (SIGINT)");
    process.exit(0);
});

app.start().catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
