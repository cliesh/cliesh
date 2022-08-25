import { Injectable } from "@angular/core";
import { BehaviorSubject, timer } from "rxjs";
import { ClashApiAuthInfrastructure } from "../infrastructure/clash-api-auth.infrastructure";

export interface Log {
  level: LogLevel;
  protocol: string;
  time: number;
}

export interface TCPOrUDPInfoLog extends Log {
  from: string;
  to: string;
  matched: string;
  node: string;
}

export interface TUNLog extends Log {
  description: string;
}

export interface DNSLog extends Log {
  source: string;
  target: string;
}

export type LogLevel = "info" | "warn" | "error" | "debug";

@Injectable({
  providedIn: "root"
})
export class LogMonitorService {
  private logBehaviorSubject = new BehaviorSubject<Log[]>([]);
  logObservable = this.logBehaviorSubject.asObservable();

  private logInfoTCPOrUDPContentRegex = /\[(.*)\]\s(\S*)\s\-\-\>\s(\S*)\smatch\s(.*)\susing\s(.*)/;
  private logDebugDNSContentRegex = /\[(.*)\]\s(\S*)\s\-\-\>\s(\S*)/;
  private logDebugTUNContentRegex = /\[(TUN)\]\s(.*)/;

  private logsReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private logs: Log[] = [];

  constructor(private clashApiAuthoriiizationService: ClashApiAuthInfrastructure) {
    this.initLogsReader();
    this.monitorLogs();
  }

  private initLogsReader() {
    if (this.logsReader !== null) this.cancelLogsReader();
    fetch(`/logs?level=debug`, this.clashApiAuthoriiizationService.authorizationHeader).then((response) => {
      this.logsReader = response.body!.getReader();
      if (response.status < 200 || response.status >= 300) timer(5000).subscribe(() => this.initLogsReader());
    });
  }

  private cancelLogsReader() {
    this.logsReader?.cancel();
    this.logsReader = null;
  }

  private monitorLogs() {
    timer(0, 1000).subscribe(() => {
      if (this.logsReader === null) return;
      this.logsReader
        .read()
        .then((result) => {
          const logsString = new TextDecoder().decode(result.value);
          if (logsString.indexOf("\n") > -1)
            logsString.split("\n").map((logString) => {
              if (logString.length > 0) this.recordLogFromString(logString);
            });
          else this.recordLogFromString(logsString);
          if (this.logs.length > 300) this.logs.pop();
          this.logBehaviorSubject.next(this.logs);
        })
        .catch((error) => {
          const isJsonUnexpected = this.jsonUnexpectedRegex.test(error.message);
          if (!isJsonUnexpected) console.log(error);
        });
    });
  }

  private recordLogFromString(logString: string) {
    const logObject = JSON.parse(logString);

    var matchResult: any = null;
    matchResult = logObject.payload.match(this.logInfoTCPOrUDPContentRegex);
    if (matchResult !== null) {
      const log: TCPOrUDPInfoLog = {
        level: logObject.type,
        protocol: matchResult[1].toLowerCase(),
        from: matchResult[2],
        to: matchResult[3],
        time: new Date().getTime(),
        matched: matchResult[4],
        node: matchResult[5]
      };
      this.logs.unshift(log);
      return;
    }
    matchResult = logObject.payload.match(this.logDebugDNSContentRegex);
    if (matchResult !== null) {
      const log: DNSLog = {
        level: logObject.type,
        protocol: matchResult[1].toLowerCase(),
        source: matchResult[2],
        target: matchResult[3],
        time: new Date().getTime()
      };
      this.logs.unshift(log);
      return;
    }

    matchResult = logObject.payload.match(this.logDebugTUNContentRegex);
    if (matchResult !== null) {
      const log: TUNLog = {
        level: logObject.type,
        protocol: matchResult[1].toLowerCase(),
        time: new Date().getTime(),
        description: matchResult[2]
      };
      this.logs.unshift(log);
      return;
    }

    console.log(logObject);

    //  {
    //     "type": "warning",
    //     "payload": "[TCP] dial DIRECT (match GeoIP/CN) to www.google.co.jp:443 error: dial tcp4 118.193.202.219:443: i/o timeout"
    // }
  }

  clearLogs() {
    this.logs = [];
    this.logBehaviorSubject.next(this.logs);
  }

  /**
   * ingore log
   */
  private jsonUnexpectedRegex = /.*Unexpected.*JSON.*/;
}
