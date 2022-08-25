import config from "config";
import * as os from "os";
import * as path from "path";

export class ConfigManager {
  get version(): string {
    return this.get<string>("version", "unknown");
  }

  get homeDirectory(): string {
    const homeDir = config.get<string>("home.directory");
    return path.join(os.homedir(), homeDir);
  }

  get loggerLevel(): string {
    return config.get<string>("logger.level");
  }

  get loggerDirectory(): string {
    const loggerDir = config.get<string>("logger.directory");
    return path.join(this.homeDirectory, loggerDir);
  }

  get clashDirectory(): string {
    const clashDir = config.get<string>("home.clash.directory");
    return path.join(this.homeDirectory, clashDir);
  }

  get settingDirectory(): string {
    const settingDir = config.get<string>("home.setting.directory");
    return path.join(this.homeDirectory, settingDir);
  }

  get databasePath(): string {
    const dbPath = config.get<string>("home.data.database.path");
    return path.join(this.homeDirectory, dbPath);
  }

  get<T>(key: string, defaultValue?: T): T {
    if (config.has(key)) {
      return config.get<T>(key);
    } else if (defaultValue !== undefined) {
      return defaultValue;
    } else {
      throw new Error(`unknown config option: ${key}`);
    }
  }

  has(key: string): boolean {
    return config.has(key);
  }
}
