import { Component } from "@angular/core";
import { ipcRenderer } from "electron";
import { platform } from "os";
import { ConfigManager } from "./core/manager/config.manager";
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

  constructor(configManager: ConfigManager, private trafficMonitorService: TrafficMonitorService) {
    this.platform = platform();
    this.version = configManager.version;
    this.trafficMonitorService.trafficObservable.subscribe((traffic) => {
      this.traffic = traffic;
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
