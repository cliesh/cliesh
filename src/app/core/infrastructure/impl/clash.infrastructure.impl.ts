import { execa, ExecaChildProcess } from "execa";
import * as fs from "fs";
import getPort from "get-port";
import { getLogger } from "log4js";
import * as os from "os";
import * as path from "path";
import { BehaviorSubject, timer } from "rxjs";
import { Stream } from "stream";
import { v4 as uuidv4 } from "uuid";
import { ClashInfrastructure, ClashProcessControllerEntry, ClashStatus } from "../clash.infrastructure";
import { ConfigInfrastructure } from "../config.infrastructure";
import { SettingInfrastructure } from "../setting.infrastructure";

const logger = getLogger("ClashInfrastructure");
const clashLogger = getLogger("Clash");

export class ClashInfrastructureImpl implements ClashInfrastructure {
  private platform = os.platform();
  private arch = os.arch();

  private clashStatusChangedBehaviorSubject = new BehaviorSubject<ClashStatus>("stopped");
  clashStatusChangedObservable = this.clashStatusChangedBehaviorSubject.asObservable();

  private clashProcess: ExecaChildProcess<string> | undefined;

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
    if (this.platform === "win32") return path.join(this.configInfrastructure.clashDirectory, "clash.exe");
    else return path.join(this.configInfrastructure.clashDirectory, "clash");
  }

  constructor(private configInfrastructure: ConfigInfrastructure, private settingInfrastructure: SettingInfrastructure) {}

  public async startClash(profilePath: string): Promise<ClashProcessControllerEntry> {
    return new Promise(async (resolve, reject) => {
      if (this.clashProcess != undefined && !this.clashProcess?.killed) {
        logger.error("Clash is already running");
        reject("Clash is already running");
        return;
      }
      try {
        // install clash if not installed or version not latest
        await this.makeSureInstalledClashVersionIsLatest();
        // start clash process
        this.clashStatusChangedBehaviorSubject.next("starting");
        const secret = uuidv4().replace(/-/g, "").substring(0, 4);
        const port = await getPort({ port: 9090 });
        const args = ["-d", this.configInfrastructure.clashDirectory, "-ext-ctl", `localhost:${port}`, "-secret", secret, "-f", profilePath];
        logger.info("The clash configuration directory is: ", this.configInfrastructure.clashDirectory);
        logger.info("Start clash with command: ", this.clashPath, args.join(" "));
        this.clashProcess = execa(this.clashPath, args, {
          cwd: this.configInfrastructure.clashDirectory,
          // windowsHide: true,
          cleanup: true,
          detached: false,
          stdin: "ignore"
        });
        this.clashProcess.stdout!.pipe(
          new Stream.Writable({
            write: function (chunk, encoding, callback) {
              clashLogger.info(`\n${chunk}\n`);
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
          if (code === 0 || code === null) {
            logger.info("Clash is stopped");
          } else {
            logger.error("Clash is stopped with code: ", code);
          }
          this.clashStatusChangedBehaviorSubject.next("stopped");
        });
        this.clashStatusChangedBehaviorSubject.next("running");
        resolve({ port: port, secret: secret });
      } catch (e) {
        this.clashStatusChangedBehaviorSubject.next("stopped");
        logger.error("Start clash failed: ", e);
        reject(e);
      }
    });
  }

  async restartClash(profilePath: string): Promise<ClashProcessControllerEntry> {
    await this.stopClash();
    return await this.startClash(profilePath);
  }

  stopClash(): Promise<void> {
    if (this.clashProcess === undefined || this.clashProcess.killed) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const killResult = this.clashProcess!.kill();
      if (!killResult) {
        reject();
        return;
      }
      const subscription = timer(1000, 3000).subscribe({
        next: () => {
          if (this.clashProcess!.killed) {
            subscription.unsubscribe();
            resolve();
          }
        }
      });
    });
  }

  private async makeSureInstalledClashVersionIsLatest(): Promise<void> {
    const programInstalled = this.isClashInstalled;
    const programVersionMatched = this.settingInfrastructure.getClashInstalledVersion() === this.configInfrastructure.clashVersionInPackage;
    if (!programInstalled || !programVersionMatched) {
      await this.installClash();
      this.settingInfrastructure.setClashInstalledVersion(this.configInfrastructure.clashVersionInPackage);
    }
  }

  get isClashInstalled(): boolean {
    return fs.existsSync(this.clashPath);
  }

  private installClash(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clashStatusChangedBehaviorSubject.next("installing");
      fs.copyFile(this.packageClashPath, this.clashPath, (err) => {
        if (err) {
          logger.error("Copy clash to runtime directory failed: ", err);
          reject(err);
        } else {
          if (this.platform === "win32") return;
          fs.chmodSync(this.clashPath, "755");
          resolve();
        }
      });
    });
  }
}
