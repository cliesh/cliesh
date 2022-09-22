import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, tap } from "rxjs";
import { ClashManager } from "../manager/clash.manager";
import { SettingManager } from "../manager/setting.manager";

export type ClashLogLevel = "info" | "warning" | "error" | "debug" | "silent";

export interface ClashConfigs {
  port: number;
  "socks-port": number;
  "redir-port": number;
  "tproxy-port": number;
  "mixed-port": number;
  authentication: [];
  "allow-lan": boolean;
  "bind-address": string;
  mode: string;
  "log-level": ClashLogLevel;
  ipv6: boolean;
}

@Injectable({
  providedIn: "root"
})
export class ClashConfigService {
  private defaultConfig: ClashConfigs = {
    port: 0,
    "socks-port": 0,
    "redir-port": 0,
    "tproxy-port": 0,
    "mixed-port": 7890,
    authentication: [],
    "allow-lan": false,
    "bind-address": "*",
    mode: "rule",
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

  private getConfig() {
    return this.httpClient.get(`${this.clashManager.baseUrl}/configs`, { headers: this.clashManager.authorizationHeaders });
  }

  private setConfig(config: ClashConfigs) {
    return this.httpClient.patch(`${this.clashManager.baseUrl}/configs`, config, { headers: this.clashManager.authorizationHeaders }).pipe(
      tap(() => {
        this.settingManager.set("clash-configs", config);
        this.configChangedBehaviorSubject.next(config);
      })
    );
  }
}
