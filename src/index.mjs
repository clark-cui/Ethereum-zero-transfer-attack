import { watchVictim } from "./utils.mjs";

import("fs")
  .then((fs) => {
    let logStream = fs.createWriteStream("output.log", { flags: "a" });

    const originalLog = console.log;
    const originalTime = console.time;
    const originalTimeEnd = console.timeEnd;

    console.log = function (message) {
      logStream.write(message + "\n");
      originalLog.apply(console, arguments);
    };

    console.time = function (label) {
      logStream.write(`Timer ${label} started\n`);
      originalTime.apply(console, arguments);
    };

    console.timeEnd = function (label) {
      logStream.write(`Timer ${label} ended\n`);
      originalTimeEnd.apply(console, arguments);
    };
  })
  .catch((error) => {
    console.error("can not import fs:", error);
  });

watchVictim();
