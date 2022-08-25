import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { ClashApiAuthInfrastructure } from "../infrastructure/clash-api-auth.infrastructure";

interface Version {
  premium: boolean;
  version: string;
}

@Injectable({
  providedIn: "root"
})
export class SettingService {
  version: Version | null = null;

  constructor(private httpClient: HttpClient, private clashApiAuthoriiizationService: ClashApiAuthInfrastructure) {
    this.getVersion().subscribe((version) => {
      this.version = version;
    });
    // this.ping().subscribe((result) => {
    //   console.log(result.hello == "clash");
    // });
  }

  private ping() {
    return this.httpClient.get("/ping", this.clashApiAuthoriiizationService.authorizationHeader) as unknown as Observable<any>;
  }

  private getVersion(): Observable<Version> {
    return this.httpClient.get("/version", this.clashApiAuthoriiizationService.authorizationHeader) as unknown as Observable<Version>;
  }
}
