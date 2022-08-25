import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { ClashApiAuthInfrastructure } from "../infrastructure/clash-api-auth.infrastructure";

export interface Rule {
  payload: string;
  proxy: string;
  type: string;
}

@Injectable({
  providedIn: "root"
})
export class RuleService {
  constructor(private httpClient: HttpClient, private clashApiAuthoriiizationService: ClashApiAuthInfrastructure) {}

  getRules(): Observable<Rule[]> {
    return this.httpClient.get("/rules", this.clashApiAuthoriiizationService.authorizationHeader).pipe(map((response: any) => response.rules as Rule[]));
  }
}
