import { configure } from "log4js";
import * as path from "path";

export class LoggerManager {
  configureLogger(directory: string, level: string) {
    configure({
      appenders: {
        cheese: {
          type: "dateFile",
          filename: path.join(directory, `${level}.log`),
          encoding: "utf-8",
          layout: {
            type: "pattern",
            pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] <%c>: %m"
          },
          maxLogSize: 10485760,
          pattern: "yyyy-MM-dd",
          keepFileExt: true,
          alwaysIncludePattern: true,
          daysToKeep: 15
        },
        out: {
          type: "stdout",
          encoding: "utf-8",
          layout: {
            type: "pattern",
            pattern: "%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] <%c>%]: %m"
          }
        },
        console: {
          type: "console"
        },
        filterConsole: {
          type: "logLevelFilter",
          appender: "console",
          level: "info"
        }
      },
      categories: {
        default: { appenders: ["cheese", "out", "filterConsole"], level }
      }
    });
  }
}
