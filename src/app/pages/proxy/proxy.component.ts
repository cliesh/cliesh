import { Component, OnInit } from "@angular/core";
import { Provider, ProvidersService } from "src/app/core/service/providers.service";
import { ProxyService } from "src/app/core/service/proxy.service";

@Component({
  selector: "app-proxy",
  templateUrl: "./proxy.component.html",
  styleUrls: ["./proxy.component.scss"]
})
export class ProxyComponent implements OnInit {
  providers: Provider[] = [];
  provider: Provider = {
    name: "string",
    proxies: [],
    type: "string",
    vehicleType: "string"
  };

  constructor(private proxyService: ProxyService, private providersService: ProvidersService) {}

  ngOnInit(): void {
    this.providersService.getProviders().subscribe((providers) => {
      this.providers = providers;
      this.provider = providers[0];
    });

    // this.proxyService.getProxyGroups().subscribe(proxyGroups => {
    //   console.log(proxyGroups)
    // })
  }
}
