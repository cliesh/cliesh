import { Component } from "@angular/core";
import { ipcRenderer } from "electron";
import { platform } from "os";
import { Subscription } from "rxjs";
import { ConfigManager } from "./core/manager/config.manager";
import { ClashService } from "./core/service/clash.service";
import { Traffic, TrafficMonitorService } from "./core/service/monitor-traffic.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  isMaximize = false;
  isAlwaysOnTop = false;

  platform: string = "linux";
  version: string = "unknown";
  traffic: Traffic = { up: 0, down: 0 };

  constructor(configManager: ConfigManager, private clashService: ClashService, private trafficMonitorService: TrafficMonitorService) {
    this.platform = platform();
    this.version = configManager.version;

    // todo: remote clash status

    this.clashService.localClashStatusChangedObservable.subscribe({
      next: (status) => {
        switch (status) {
          case "running":
            this.createTrafficMonitor();
            break;
          default:
            this.trafficMonitor?.unsubscribe();
            this.trafficMonitor = undefined;
            break;
        }
      }
    });
  }

  trafficMonitor: Subscription | undefined;

  createTrafficMonitor(): void {
    this.trafficMonitor = this.trafficMonitorService.trafficObservable.subscribe({
      next: (traffic) => {
        this.traffic = traffic;
      }
    });
  }

  ngOnInit(): void {
    // there is a delay
    ipcRenderer.on("window", (event, message) => {
      switch (message) {
        case "maximize":
          this.isMaximize = true;
          break;
        case "unmaximize":
          this.isMaximize = false;
          break;
        // case "affixed":
        //   this.isAlwaysOnTop = true;
        //   break;
        // case "unaffix":
        //   this.isAlwaysOnTop = false;
        //   break;
      }
    });
  }

  /**
   * set window to always on top
   */
  alwaysOnTop(): void {
    ipcRenderer.invoke("window", "affix");
    this.isAlwaysOnTop = !this.isAlwaysOnTop;
  }

  minimize(): void {
    ipcRenderer.invoke("window", "minimize");
  }

  maximize(): void {
    ipcRenderer.invoke("window", "maximize");
  }

  unmaximize(): void {
    ipcRenderer.invoke("window", "unmaximize");
  }

  exit(): void {
    ipcRenderer.invoke("window", "close");
  }
}
