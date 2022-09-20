import { getLogger } from "log4js";
import { BehaviorSubject } from "rxjs";
import { ClashInfrastructure } from "../infrastructure/clash.infrastructure";
import { ConfigManager } from "./config.manager";
import { SettingManager } from "./setting.manager";

export type ClashType = "local" | "remote";

export interface ClashConfig {
  clashType: ClashType;
}

export interface LocalClashConfig extends ClashConfig {
  clashType: "local";
  profilePath: string;
}

export interface RemoteClashConfig extends ClashConfig {
  clashType: "remote";
  schema: string;
  host: string;
  port: number;
  authorization: string;
}

export class ClashManager {
  logger = getLogger("ClashManager");

  private schema: string | undefined;
  private host: string | undefined;
  private port: number | undefined;
  get baseUrl(): string {
    if (this.schema === undefined || this.host === undefined || this.port === undefined) throw new Error("clash not configured");
    return `${this.schema}${this.host}:${this.port}`;
  }

  private authorizationToken: string | undefined;
  get authorizationHeaders(): any {
    if (this.authorizationToken === undefined) {
      return undefined;
    } else {
      return {
        Authorization: `Bearer ${this.authorizationToken}`
      }
    };
  }

  private clashConfigChangedBehaviorSubject = new BehaviorSubject<undefined | true>(undefined);
  clashConfigChangedObservable = this.clashConfigChangedBehaviorSubject.asObservable();

  constructor(private clashInfrastructure: ClashInfrastructure, private configManager: ConfigManager, private settingManager: SettingManager) { }

  async changeConfig(config: LocalClashConfig | RemoteClashConfig): Promise<void> {
    if (config.clashType === "local") {
      await this.makeSureInstalledClashVersionIsLasted();
      await this.changeToLocalClashConfig(config as LocalClashConfig);
    } else {
      await this.changeToRemoteClashConfig(config as RemoteClashConfig);
      if (this.clashInfrastructure.isClashRunning) this.clashInfrastructure.stopClash();
    }
    this.resetSystemProxy();
    this.clashConfigChangedBehaviorSubject.next(true);
  }

  private async changeToLocalClashConfig(config: LocalClashConfig): Promise<void> {
    const entry = await this.clashInfrastructure.restartClash(config.profilePath);
    this.schema = "http://";
    this.host = "127.0.0.1";
    this.port = entry.port;
    this.authorizationToken = entry.secret;
  }

  private changeToRemoteClashConfig(config: RemoteClashConfig): Promise<void> {
    this.schema = config.schema;
    this.host = config.host;
    this.port = config.port;
    this.authorizationToken = config.authorization;
    return Promise.resolve();
  }

  get isClashConnected(): boolean {
    try {
      return this.baseUrl !== undefined;
    } catch (error) {
      return false;
    }
  }

  private async makeSureInstalledClashVersionIsLasted(): Promise<void> {
    const programInstalled = this.clashInfrastructure.clashInstalled;
    const programVersionMatched = this.settingManager.clashVersionInstalled === this.configManager.clashVersionInPackage;
    if (!programInstalled || !programVersionMatched) {
      await this.clashInfrastructure.installClash();
      this.settingManager.setClashVersionInstalled(this.configManager.clashVersionInPackage);
    }
  }

  private resetSystemProxy(): void {
    this.logger.warn("resetSystemProxy not implemented");
  }
}
