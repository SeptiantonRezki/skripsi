import { NgModule } from "@angular/core";

import { KeysPipe } from "./keys.pipe";
import { GetByIdPipe } from "./getById.pipe";
import { HtmlToPlaintextPipe } from "./htmlToPlaintext.pipe";
import { FilterPipe } from "./filter.pipe";
import { CamelCaseToDashPipe } from "./camelCaseToDash.pipe";
import { RupiahFormaterPipe, RupiahFormaterWithoutRpPipe } from "./rupiah-formater";
import { CapitalizePipe } from "./capitalize";

@NgModule({
  declarations: [
    KeysPipe,
    GetByIdPipe,
    HtmlToPlaintextPipe,
    FilterPipe,
    CamelCaseToDashPipe,
    RupiahFormaterPipe,
    CapitalizePipe,
    RupiahFormaterWithoutRpPipe
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
    RupiahFormaterWithoutRpPipe
  ]
})
export class FusePipesModule {}
