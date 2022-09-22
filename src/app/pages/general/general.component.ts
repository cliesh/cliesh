import { Component, OnInit } from "@angular/core";
import { ClashConfigs, ClashConfigService } from "src/app/core/service/clash-config.service";

@Component({
  selector: "app-general",
  templateUrl: "./general.component.html",
  styleUrls: ["./general.component.scss"]
})
export class GeneralComponent implements OnInit {
  config!: ClashConfigs;

  constructor(private clashConfigService: ClashConfigService) {
    this.clashConfigService.configChanged$.subscribe({
      next: (config) => {
        this.config = config;
      }
    });
  }

  ngOnInit(): void {}
}
