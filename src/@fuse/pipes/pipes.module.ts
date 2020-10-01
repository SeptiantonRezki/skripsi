import { NgModule } from "@angular/core";

import { KeysPipe } from "./keys.pipe";
import { GetByIdPipe } from "./getById.pipe";
import { HtmlToPlaintextPipe } from "./htmlToPlaintext.pipe";
import { FilterPipe, DateToMomentPipe } from "./filter.pipe";
import { CamelCaseToDashPipe } from "./camelCaseToDash.pipe";
import {
  RupiahFormaterPipe,
  RupiahFormaterWithoutRpPipe
} from "./rupiah-formater";
import { CapitalizePipe } from "./capitalize";
import { TimeRemainingPipe } from "./time-remaining.pipe";

@NgModule({
  declarations: [
    KeysPipe,
    GetByIdPipe,
    HtmlToPlaintextPipe,
    FilterPipe,
    CamelCaseToDashPipe,
    RupiahFormaterPipe,
    CapitalizePipe,
    RupiahFormaterWithoutRpPipe,
    DateToMomentPipe,
    TimeRemainingPipe
  ],
  imports: [],
  exports: [
    KeysPipe,
    GetByIdPipe,
    HtmlToPlaintextPipe,
    FilterPipe,
    CamelCaseToDashPipe,
    RupiahFormaterPipe,
    CapitalizePipe,
    RupiahFormaterWithoutRpPipe,
    DateToMomentPipe,
    TimeRemainingPipe
  ]
})
export class FusePipesModule { }
