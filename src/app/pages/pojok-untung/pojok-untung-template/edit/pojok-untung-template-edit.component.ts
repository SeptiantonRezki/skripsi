import { Component, OnInit } from '@angular/core';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-pojok-untung-template-edit',
  templateUrl: './pojok-untung-template-edit.component.html',
  styleUrls: ['./pojok-untung-template-edit.component.scss']
})
export class PojokUntungTemplateEditComponent implements OnInit {
  public optionsGeneral: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG();

  constructor(
    private ls: LanguagesService
  ) { }

  ngOnInit() {
  }

}
