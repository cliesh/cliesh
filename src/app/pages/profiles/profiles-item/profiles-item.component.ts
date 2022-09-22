import { Component, Input, OnInit } from "@angular/core";
import { firstValueFrom, timer } from "rxjs";
import { NotificationService } from "src/app/core/service/notification.service";
import { FileProfile, Profile, ProfilesService, RemoteProfile } from "src/app/core/service/profiles.service";

@Component({
  selector: "app-profiles-item",
  templateUrl: "./profiles-item.component.html",
  styleUrls: ["./profiles-item.component.scss"]
})
export class ProfilesItemComponent implements OnInit {
  @Input()
  profile?: Profile;
  selected: boolean = false;
  loadding: boolean = false;

  type: string = "unknown";
  fileProfile?: FileProfile;
  remoteProfile?: RemoteProfile;

  constructor(private profilesService: ProfilesService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.profilesService.profileSelectedChanged$.subscribe((selectedProfile) => {
      if (selectedProfile === undefined || this.profile === undefined) return;
      this.selected = selectedProfile!.id === this.profile!.id;
    });

    switch (this.profile?.type) {
      case "file":
        this.fileProfile = this.profile as FileProfile;
        this.type = this.fileProfile.subscribeUrl === undefined ? "local file" : "remote file";
        break;
      case "remote":
        this.type = "remote connection";
        this.remoteProfile = this.profile as RemoteProfile;
        break;
    }
  }

  async selectProfile(): Promise<void> {
    if (this.selected || this.loadding) return;
    try {
      this.loadding = true;
      // for ui animation
      await firstValueFrom(timer(1000));
      await this.profilesService.selectProfile(this.profile!.id);
    } catch (e: any) {
      this.notificationService.notification("Change profile failed", e.message);
    } finally {
      this.loadding = false;
    }
  }
}
