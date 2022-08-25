import { Injectable } from "@angular/core";
import * as child_process from "child_process";
import * as fs from "fs";
import { getLogger } from "log4js";
import { AddressInfo, createServer } from "net";
import * as uuid from "node-uuid";
import * as os from "os";
import * as path from "path";
import { ConfigManager } from "../manager/config.manager";

@Injectable({
  providedIn: "root"
})
export class ClashInfrastructure {
  private logger = getLogger("ClashInfrastructure");
  private platform = os.platform();

  /**
   * path of the package clash
   */
  private get packageClashPath(): string {
    var regex: RegExp;
    const arch = os.arch();
    switch (this.platform) {
      case "darwin":
        switch (arch) {
          case "x64":
            regex = /.*darwin.*amd64.*/;
            break;
          default:
            throw "Don't support this architecture: " + arch;
        }
        break;
      case "win32":
        switch (arch) {
          case "x64":
            regex = /.*windows.*amd64.*/;
            break;
          default:
            throw "Don't support this architecture: " + arch;
        }
        break;
      default:
        throw "Don't support this platform: " + this.platform;
    }

    var fileName: string;
    fs.readdirSync("package/clash").forEach((file) => {
      if (regex.test(file)) fileName = file;
    });
    if(fileName! === undefined) throw new Error("Can't find the package of clash");
    return path.join("package", "clash", fileName!);
  }
  
  /**
   * path of the runtime clash
   */
   private get clashPath(): string {
    return path.join(this.configManager.clashDirectory, "clash");
  }

  constructor(private configManager: ConfigManager) {
    const clashExist = fs.existsSync(this.clashPath);
    if (!clashExist) {
      fs.mkdirSync(this.configManager.clashDirectory, { recursive: true });
      fs.copyFileSync(this.packageClashPath, this.clashPath);
    }
    console.log("The clash configuration directory is: ", this.configManager.clashDirectory);
  }

  public async startClash(): Promise<string> {
    const guid = uuid.v4().replace(/-/g, "");
    const port = await this.getPortFree();
    const command = `${this.clashPath} -d ${this.configManager.clashDirectory} -ext-ctl localhost:${port} -secret ${guid}`;
    this.logger.info("Start clash with command: ", command);
    return this.execSpawn(this.clashPath, ["-d", this.configManager.clashDirectory, "-ext-ctl", `localhost:${port}`, "-secret", guid]);
  }

  private execSpawn(command: string, args: Array<string>): Promise<string> {
    return new Promise<string>(function (resolve: any, reject: any) {
      let spawnReady = child_process.spawn(command, args, { stdio: ["pipe", "pipe", "pipe"], shell: true });
      spawnReady.stdout.on("data", (chunk) => {
        const result = chunk.toString();
        console.log(result);
      });
      let result = "";
      spawnReady.stderr.on("data", (chunk) => {
        result += chunk.toString();
      });
      spawnReady.on("exit", (code) => {
        if (code !== 0) reject(result);
      });
      resolve();
    });
  }

  private getPortFree() {
    return new Promise((res) => {
      const srv = createServer();
      srv.listen(0, () => {
        const info = srv.address() as AddressInfo;
        srv.close((err) => res(info.port));
      });
    });
  }
}
