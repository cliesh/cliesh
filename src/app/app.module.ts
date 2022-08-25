import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import zh from "@angular/common/locales/zh";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NZ_I18N, zh_CN } from "ng-zorro-antd/i18n";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ClashApiAuthInfrastructure } from "./core/infrastructure/clash-api-auth.infrastructure";
import { ClashInfrastructure } from "./core/infrastructure/clash.infrastructure";
import { ConfigManager } from "./core/manager/config.manager";
import { LoggerManager } from "./core/manager/logger.manager";
import { ManagerModule } from "./core/manager/manager.module";
import { IconsProviderModule } from "./icons-provider.module";
import { ConnectionModule } from "./pages/connection/connection.module";
import { LogsModule } from "./pages/logs/logs.module";
import { ProxyModule } from "./pages/proxy/proxy.module";
import { RueModule } from "./pages/rule/rule.module";
import { PipeModule } from "./pipe/pipe.module";

registerLocaleData(zh);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    RueModule,
    ConnectionModule,
    LogsModule,
    ProxyModule,
    PipeModule,
    ManagerModule
  ],
  providers: [
    {
      provide: NZ_I18N,
      useValue: zh_CN
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ClashInfrastructure, ClashApiAuthInfrastructure, ConfigManager, LoggerManager],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function initializeApp(
  clashInfrastructure: ClashInfrastructure,
  clashApiAuthoriiizationService: ClashApiAuthInfrastructure,
  configManager: ConfigManager,
  loggerManager: LoggerManager
) {
  return async (): Promise<void> => {
    // configure logger
    loggerManager.configureLogger(configManager.loggerDirectory, configManager.loggerLevel);
    // start clash
    await clashInfrastructure.startClash();
    // set api authentication secret
    // clashApiAuthoriiizationService.setAuthorizationToken("Bearer 87836eaa-5cc3-45cf-aed1-e9bf353da306")
    clashApiAuthoriiizationService.setAuthorizationToken("Bearer 10922");
  };
}
