import { NgModule } from "@angular/core";

import { KeysPipe } from "./keys.pipe";
import { GetByIdPipe } from "./getById.pipe";
import { HtmlToPlaintextPipe } from "./htmlToPlaintext.pipe";
import { FilterPipe, DateToMomentPipe, ExcludeArrayPipe, DateRangePipe } from "./filter.pipe";
import { CamelCaseToDashPipe } from "./camelCaseToDash.pipe";
import {
  RupiahFormaterPipe,
  RupiahFormaterWithoutRpPipe
} from "./rupiah-formater";
import { CapitalizePipe } from "./capitalize";
import { TimeRemainingPipe } from "./time-remaining.pipe";
import { UnderscoreToCapitalizePipe } from "./underscore-to-capitalize.pipe";
import { TranslateInterpolatePipe } from "./translateInterpolate.pipe";
import { BreadCrumbTranslatePipe } from "./bradcrumb-translate.pipe";
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
    ExcludeArrayPipe,
    TimeRemainingPipe,
    UnderscoreToCapitalizePipe,
    TranslateInterpolatePipe,
    BreadCrumbTranslatePipe,
    DateRangePipe,
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
    ExcludeArrayPipe,
    TimeRemainingPipe,
    UnderscoreToCapitalizePipe,
    TranslateInterpolatePipe,
    BreadCrumbTranslatePipe,
    DateRangePipe,
  ]
})
export class FusePipesModule { }
