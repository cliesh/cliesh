import { Component, OnInit } from "@angular/core";
import { LogMonitorService } from "src/app/core/service/monitor-log.service";

@Component({
  selector: "app-logs",
  templateUrl: "./logs.component.html",
  styleUrls: ["./logs.component.scss"]
})
export class LogsComponent implements OnInit {
  level = "info";

  private allLogs: any[] = [];
  logs: any[] = [];

  constructor(private logMonitorService: LogMonitorService) {
    this.logMonitorService.logObservable.subscribe((logs) => {
      this.allLogs = logs;
      this.filterLogs();
    });
  }

  ngOnInit(): void {}

  filterLogs() {
    this.logs = this.allLogs.filter((log) => {
      if (this.level === "all") return true;
      return log.level == this.level;
    });
  }

  clear() {
    this.logMonitorService.clearLogs();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
