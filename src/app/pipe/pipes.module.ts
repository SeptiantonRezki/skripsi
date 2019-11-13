import { SafeHtmlPipe } from "./safe-html";
import { NgModule } from "@angular/core";

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [ 
    SafeHtmlPipe
  ],
  exports: [
    SafeHtmlPipe
  ]
})
export class PipesModule {}