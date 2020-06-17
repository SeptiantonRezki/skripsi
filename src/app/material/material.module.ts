import { NgModule } from "@angular/core";
import {
  MatRadioModule,
  MatCheckboxModule,
  MatSlideToggleModule,
} from "@angular/material";

const MaterialComponents = [
  MatRadioModule,
  MatCheckboxModule,
  MatSlideToggleModule,
];

@NgModule({
  imports: [MaterialComponents],
  exports: [MaterialComponents],
})
export class MaterialModule {}
