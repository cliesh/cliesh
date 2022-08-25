import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ClashApiAuthInfrastructure } from "../infrastructure/clash-api-auth.infrastructure";

export interface Provider {
  name: string;
  proxies: Proxy[];
  type: string;
  vehicleType: string;
}

export interface Proxy {
  history: any[];
  name: string;
  type: string;
  udp: boolean;
}

@Injectable({
  providedIn: "root"
})
export class ProvidersService {
  constructor(private httpClient: HttpClient, private clashApiAuthInfrastructure: ClashApiAuthInfrastructure) {}

  getProviders(): Observable<Provider[]> {
    return this.httpClient.get("/providers/proxies", this.clashApiAuthInfrastructure.authorizationHeader).pipe(
      map((obj) => {
        const object = obj as any;
        const providers = object.providers as any;
        delete providers.default;
        return providers;
      }),
      map((providers) => {
        const result: Provider[] = [];
        Object.entries(providers).forEach((provider) => {
          result.push(provider[1] as Provider);
        });
        return result;
      })
    );
  }

  getProviderInformation(provider: string): Observable<Provider> {
    return (this.httpClient.get<Provider>(`/providers/proxies/${provider}`, this.clashApiAuthInfrastructure.authorizationHeader) as unknown) as Observable<Provider>;
  }

  selectProvider(provider: string) {
    const body = {};
    return this.httpClient.put(`/providers/proxies/${provider}`, body);
  }

  checkProviderHealth(provider: string): Observable<Provider> {
    return this.httpClient.get<Provider>(`/providers/proxies/${provider}/healthcheck`);
  }
}
