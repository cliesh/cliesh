import { Injectable } from "@angular/core";
import { BehaviorSubject, timer } from "rxjs";
import { ClashApiAuthInfrastructure } from "../infrastructure/clash-api-auth.infrastructure";

export interface Traffic {
  up: number;
  down: number;
}

@Injectable({
  providedIn: "root"
})
export class TrafficMonitorService {
  private trafficBehaviorSubject = new BehaviorSubject<Traffic>({ up: 0, down: 0 });
  trafficObservable = this.trafficBehaviorSubject.asObservable();

  private trafficReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  constructor(private clashApiAuthoriiizationService: ClashApiAuthInfrastructure) {
    this.initTrafficReader();
    this.monitorTraffic();
  }

  private initTrafficReader() {
    if (this.trafficReader !== null) this.cancelTrafficReader();
    fetch(`/traffic`, this.clashApiAuthoriiizationService.authorizationHeader).then((response) => {
      this.trafficReader = response.body!.getReader();
      if (response.status < 200 || response.status >= 300) timer(5000).subscribe(() => this.initTrafficReader());
    });
  }

  private cancelTrafficReader() {
    this.trafficReader?.cancel();
    this.trafficReader = null;
  }

  private monitorTraffic() {
    timer(0, 1000).subscribe(() => {
      if (this.trafficReader === null) return;
      this.trafficReader
        .read()
        .then((result) => {
          const trafficString = new TextDecoder().decode(result.value);
          const traffic = JSON.parse(trafficString);
          this.trafficBehaviorSubject.next(traffic);
        })
        .catch((error) => {
          const isJsonUnexpected = this.jsonUnexpectedRegex.test(error.message);
          if (!isJsonUnexpected) console.log(error);
        });
    });
  }

  /**
   * ingore log
   */
  private jsonUnexpectedRegex = /.*Unexpected.*JSON.*/;
}
