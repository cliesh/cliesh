import { Injectable } from "@angular/core";
import { getLogger } from "log4js";
import { ClashManager } from "../manager/clash.manager";
import { FileProfile, Profile, ProfilesService, RemoteProfile } from "./profiles.service";

@Injectable({
  providedIn: "root"
})
export class ClashService {
  logger = getLogger("ClashService");

  constructor(private profilesService: ProfilesService, private clashManager: ClashManager) {
    this.profilesService.profileSelectedChangedObservable.subscribe((profile) => {
      if (!profile) return;
      const type = profile.type === "file" ? "file profile" : "remote profile";
      this.logger.info(`profile selected changed to ${type}: `, profile?.id);
      this.changeProfile(profile);
    });
  }

  get isClashConnected(): boolean {
    return this.clashManager.isClashConnected;
  }

  private async changeProfile(profile: Profile): Promise<void> {
    if (profile.type === "file") {
      const fileProfile = profile as FileProfile;
      await this.clashManager.changeConfig({
        clashType: "local",
        profilePath: fileProfile.path
      });
    } else if (profile.type === "remote") {
      const remoteProfile = profile as RemoteProfile;
      await this.clashManager.changeConfig({
        clashType: "remote",
        schema: remoteProfile.schema,
        host: remoteProfile.host,
        port: remoteProfile.port,
        authorization: remoteProfile.authorization
      });
    }
  }
}
