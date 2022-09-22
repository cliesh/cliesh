import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { ClashManager } from "../manager/clash.manager";
import { SettingManager } from "../manager/setting.manager";

export type ClashLogLevelType = "info" | "warning" | "error" | "debug" | "silent";
export type ClashModeType = "global" | "rule" | "direct";

export interface ClashConfigs {
  port?: number;
  "socks-port"?: number;
  "redir-port"?: number;
  "tproxy-port"?: number;
  "mixed-port"?: number;
  authentication?: [];
  "allow-lan"?: boolean;
  "bind-address"?: string;
  mode?: ClashModeType;
  "log-level"?: ClashLogLevelType;
  ipv6?: boolean;
}

@Injectable({
  providedIn: "root"
})
export class ClashConfigService {
  private hostRegex = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/;
  private defaultConfig: ClashConfigs = {
    port: 0,
    "socks-port": 0,
    "redir-port": 0,
    "tproxy-port": 0,
    "mixed-port": 7890,
    authentication: [],
    "allow-lan": false,
    "bind-address": "*",
    mode: undefined,
    "log-level": "info",
    ipv6: false
  };

  private configChangedBehaviorSubject = new BehaviorSubject<ClashConfigs>(this.defaultConfig);
  configChanged$ = this.configChangedBehaviorSubject.asObservable();

  constructor(private httpClient: HttpClient, private clashManager: ClashManager, private settingManager: SettingManager) {
    const clashConfigsOnDisk = this.settingManager.get<ClashConfigs>("clash-configs");
    if (clashConfigsOnDisk === undefined) {
      this.settingManager.set("clash-configs", this.defaultConfig);
    } else {
      this.configChangedBehaviorSubject.next(clashConfigsOnDisk);
    }
  }

  loadConfigFromDisk(): ClashConfigs {
    return this.settingManager.get<ClashConfigs>("clash-configs")!;
  }

  getConfig(): Observable<any> {
    return this.httpClient.get(`${this.clashManager.baseUrl}/configs`, { headers: this.clashManager.authorizationHeaders });
  }

  updateConfig(config: ClashConfigs): Observable<any> {
    this.verifyConfig(config);
    return this.httpClient.patch(`${this.clashManager.baseUrl}/configs`, config, { headers: this.clashManager.authorizationHeaders }).pipe(
      tap(() => {
        this.settingManager.set("clash-configs", config);
        this.configChangedBehaviorSubject.next(config);
      })
    );
  }

  private verifyConfig(config: ClashConfigs) {  
    if (config.port !== undefined && !this.verifyPort(config.port)) throw new Error("Invalid port");
    if (config["socks-port"] !== undefined && !this.verifyPort(config["socks-port"])) throw new Error("Invalid socks-port");
    if (config["redir-port"] !== undefined && !this.verifyPort(config["redir-port"])) throw new Error("Invalid redir-port");
    if (config["tproxy-port"] !== undefined && !this.verifyPort(config["tproxy-port"])) throw new Error("Invalid tproxy-port");
    if (config["mixed-port"] !== undefined && !this.verifyPort(config["mixed-port"])) throw new Error("Invalid mixed-port");
    if (config["bind-address"] !== undefined && config["bind-address"] !== '*' && this.hostRegex.test(config["bind-address"]) === false) throw new Error("Invalid bind address");
    if (config["log-level"] !== undefined && ["info", "warning", "error", "debug", "silent"].includes(config["log-level"]) === false) throw new Error("Invalid log level");
    if (config.mode !== undefined && ["global", "rule", "direct"].includes(config.mode) === false) throw new Error("Invalid mode");
  }

  private verifyPort(port: number): boolean {
    return port >= 0 && port <= 65535;
  }
}
