import { Injectable } from "@angular/core";

/**
 * system notification service
 */
@Injectable({
  providedIn: "root"
})
export class NotificationService {
  constructor() {}

  notification(title: string, message: string) {
    new Notification(title, {
      icon: "assets/logo.png",
      body: message
    });
  }
}
