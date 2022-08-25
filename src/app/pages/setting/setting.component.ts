import { Component, OnInit } from "@angular/core";
import { SettingService } from "src/app/core/service/setting.service";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.scss"]
})
export class SettingComponent implements OnInit {
  constructor(private settingService: SettingService) {}

  ngOnInit(): void {}
}
