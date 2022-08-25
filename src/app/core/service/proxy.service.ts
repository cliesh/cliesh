import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { concatMap, filter, map, of } from "rxjs";
import { ClashApiAuthInfrastructure } from "../infrastructure/clash-api-auth.infrastructure";

@Injectable({
  providedIn: "root"
})
export class ProxyService {
  constructor(private httpClient: HttpClient, private clashApiAuthInfrastructure: ClashApiAuthInfrastructure) {}

  private getProxies() {
    return this.httpClient.get("/proxies", this.clashApiAuthInfrastructure.authorizationHeader).pipe(
      map((obj) => {
        const object = obj as any;
        return Object.entries(object.proxies);
      }),
      concatMap((proxies) => of(...proxies)),
      map((proxiy) => proxiy[1])
    );
  }

  getProxyGroups() {
    return this.getProxies().pipe(
      filter((proxiy) => {
        const x = proxiy as any;
        return x.all !== undefined;
      }),
      map((proxiy) => {
        // console.log(proxiy);
        return proxiy;
      })
    );
  }
}
