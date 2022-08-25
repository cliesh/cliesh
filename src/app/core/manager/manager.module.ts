import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ConfigManager } from "./config.manager";
import { LoggerManager } from "./logger.manager";
import { SettingManager } from "./setting.manager";

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    {
      provide: LoggerManager,
      useFactory: () => new LoggerManager()
    },
    {
      provide: ConfigManager,
      useFactory: () => new ConfigManager()
    },
    {
      provide: SettingManager,
      useFactory: (configManager: ConfigManager) => new SettingManager(configManager.settingDirectory),
      deps: [ConfigManager]
    }
  ]
})
export class ManagerModule {
  constructor() {}
}
