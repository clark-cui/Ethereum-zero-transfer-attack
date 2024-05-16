import { watchVictim } from "./utils.mjs";

// 使用动态导入来导入 fs 模块
import("fs")
  .then((fs) => {
    // 创建一个可写的流
    let logStream = fs.createWriteStream("output.log", { flags: "a" });

    // 重定向console.log的输出
    console.log = function (message) {
      logStream.write(message + "\n");
      process.stdout.write(message + "\n");
    };
  })
  .catch((error) => {
    console.error("无法导入 fs 模块:", error);
  });

watchVictim();
