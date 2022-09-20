import { Component, Input, OnInit } from "@angular/core";
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

  type: string = "unknown";
  fileProfile?: FileProfile;
  remoteProfile?: RemoteProfile;

  constructor(private profilesService: ProfilesService) {
  }

  ngOnInit(): void {
    this.profilesService.profileSelectedChangedObservable.subscribe((selectedProfile) => {
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

  selectProfile(): void {
    if(this.selected) return;
    this.profilesService.selectProfile(this.profile!.id);
  }
}
