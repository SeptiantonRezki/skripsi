import { Component, OnInit } from '@angular/core';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-pojok-untung-template-create',
  templateUrl: './pojok-untung-template-create.component.html',
  styleUrls: ['./pojok-untung-template-create.component.scss']
})
export class PojokUntungTemplateCreateComponent implements OnInit {
  public optionsGeneral: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG();

  constructor(
    private ls: LanguagesService
  ) { }

  ngOnInit() {
  }

}
