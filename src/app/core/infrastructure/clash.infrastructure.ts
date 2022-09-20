import { Injectable } from "@angular/core";
import { execa, ExecaChildProcess } from "execa";
import * as fs from "fs";
import getPort from "get-port";
import { getLogger } from "log4js";
import * as os from "os";
import * as path from "path";
import { Stream } from "stream";
import { v4 as uuidv4 } from "uuid";
import { ConfigManager } from "../manager/config.manager";

const logger = getLogger("ClashInfrastructure");
const clashLogger = getLogger("Clash");

export interface ClashProcessControllerEntry {
  port: number;
  secret: string;
}

@Injectable({
  providedIn: "root"
})
export class ClashInfrastructure {
  private platform = os.platform();
  private arch = os.arch();

  private clashProcess: ExecaChildProcess<string> | undefined;
  get isClashRunning(): boolean {
    return this.clashProcess !== undefined;
  }

  /**
   * path of the package clash
   */
  private get packageClashPath(): string {
    var regex: RegExp;
    switch (this.platform) {
      case "linux":
        switch (this.arch) {
          case "x64":
            regex = /.*linux.*amd64.*/;
            break;
          default:
            throw "Don't support this architecture: " + this.arch;
        }
        break;
      case "darwin":
        switch (this.arch) {
          case "x64":
            regex = /.*darwin.*amd64.*/;
            break;
          default:
            throw "Don't support this architecture: " + this.arch;
        }
        break;
      case "win32":
        switch (this.arch) {
          case "x64":
            regex = /.*windows.*amd64.*/;
            break;
          default:
            throw "Don't support this architecture: " + this.arch;
        }
        break;
      default:
        throw "Don't support this platform: " + this.platform;
    }

    const fileName = fs.readdirSync("package/clash").find((file) => {
      return regex.test(file);
    });
    if (fileName! === undefined) {
      logger.error(`Can't find the package of clash: [os:${this.platform}, arch:${this.arch}]`);
      throw new Error(`Can't find the package of clash: [os:${this.platform}, arch:${this.arch}]`);
    }
    return path.join("package", "clash", fileName!);
  }

  /**
   * path of the runtime clash
   */
  private get clashPath(): string {
    if (this.platform === "win32") return path.join(this.configManager.clashDirectory, "clash.exe");
    else return path.join(this.configManager.clashDirectory, "clash");
  }

  get clashInstalled(): boolean {
    return fs.existsSync(this.clashPath);
  }

  constructor(private configManager: ConfigManager) { }

  /**
   * start clash
   *
   * @param path path of the config file
   */
  public async startClash(profilePath: string): Promise<ClashProcessControllerEntry> {
    if (this.clashProcess !== undefined) {
      logger.error("Clash is already running");
      throw new Error("Clash is already running");
    }

    // start clash process
    const secret = uuidv4().replace(/-/g, "").substring(0, 4);
    const port = await getPort({ port: 9090 });
    const args = ["-d", this.configManager.clashDirectory, "-ext-ctl", `localhost:${port}`, "-secret", secret, "-f", profilePath];
    logger.info("The clash configuration directory is: ", this.configManager.clashDirectory);
    logger.info("Start clash with command: ", this.clashPath, args.join(" "));
    this.clashProcess = execa(this.clashPath, args, {
      cwd: this.configManager.clashDirectory,
      // windowsHide: true,
      cleanup: true,
      detached: false,
      stdin: "ignore"
    });
    this.clashProcess.stdout!.pipe(
      new Stream.Writable({
        write: function (chunk, encoding, callback) {
          clashLogger.error(`\n${chunk}\n`);
          callback();
        }
      })
    );
    this.clashProcess.stderr!.pipe(
      new Stream.Writable({
        write: function (chunk, encoding, callback) {
          clashLogger.error(`\n${chunk}\n`);
          callback();
        }
      })
    );
    this.clashProcess.addListener("exit", (code, signal) => {
      if (code === 0) {
        logger.info("Clash is stopped");
      } else {
        logger.error("Clash is stopped with code: ", code);
      }
    });
    return { port, secret };
  }

  async restartClash(profilePath: string): Promise<ClashProcessControllerEntry> {
    this.stopClash();
    return await this.startClash(profilePath);
  }

  stopClash(): void {
    this.clashProcess?.kill();
    this.clashProcess = undefined;
  }

  installClash(): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.copyFile(this.packageClashPath, this.clashPath, (err) => {
        if (err) {
          logger.error("Copy clash to runtime directory failed: ", err);
          reject(err);
        } else {
          if (this.platform === "win32") return
          fs.chmodSync(this.clashPath, "755");
          resolve();
        }
      });
    });
  }
}
