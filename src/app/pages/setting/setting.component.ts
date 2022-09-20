import { Component, OnInit } from "@angular/core";
import { ClashService } from "src/app/core/service/clash.service";
import { SettingService, Version } from "src/app/core/service/setting.service";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.scss"]
})
export class SettingComponent implements OnInit {
  clashVersion: Version | undefined;

  constructor(private clashService: ClashService, private settingService: SettingService) {
    if (this.clashService.isClashConnected) {
      this.settingService.getVersion().subscribe((version) => {
        this.clashVersion = version;
      });
    }
  }

  ngOnInit(): void {}
}
