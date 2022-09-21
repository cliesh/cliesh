import { Observable } from "rxjs";

export interface ClashProcessControllerEntry {
  port: number;
  secret: string;
}

export type ClashStatus = "installing" | "starting" | "running" | "stopping" | "stopped";

export abstract class ClashInfrastructure {
  abstract clashStatusChangedObservable: Observable<ClashStatus>;

  /**
   * start clash process
   *
   * @param path path of the config file
   */
  abstract startClash(profilePath: string): Promise<ClashProcessControllerEntry>;

  /**
   * restart clash process
   *
   * @param path path of the config file
   */
  abstract restartClash(profilePath: string): Promise<ClashProcessControllerEntry>;

  /**
   * kill clash process
   *
   * @param path path of the config file
   */
  abstract stopClash(): Promise<void> ;
}
