import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ClashApiAuthInfrastructure {
  private authorizationToken: string | null = null;

  setAuthorizationToken(token: string): void {
    this.authorizationToken = token;
  }

  get authorizationHeader(): any {
    if (this.authorizationToken === null) {
      return undefined;
    } else {
      return {
        headers: {
          Authorization: this.authorizationToken
        }
      };
    }
  }
}
