import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ClashInfrastructure } from "../infrastructure/clash.infrastructure";
import { ClashManager } from "./clash.manager";
import { ConfigManager } from "./config.manager";
import { LoggerManager } from "./logger.manager";
import { SettingManager } from "./setting.manager";

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    {
      provide: ClashManager,
      useFactory: (clashInfrastructure: ClashInfrastructure, configManager: ConfigManager, settingManager: SettingManager) =>
        new ClashManager(clashInfrastructure, configManager, settingManager),
      deps: [ClashInfrastructure, ConfigManager, SettingManager]
    },
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
