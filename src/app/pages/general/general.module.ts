import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NzDividerModule } from "ng-zorro-antd/divider";
import { GeneralComponent } from "./general.component";

@NgModule({
  declarations: [GeneralComponent],
  imports: [BrowserModule, CommonModule, NzDividerModule]
})
export class GeneralModule {}
