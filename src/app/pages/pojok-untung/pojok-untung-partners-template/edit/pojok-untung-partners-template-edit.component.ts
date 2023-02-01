import { Component, OnInit } from '@angular/core';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-pojok-untung-partners-template-edit',
  templateUrl: './pojok-untung-partners-template-edit.component.html',
  styleUrls: ['./pojok-untung-partners-template-edit.component.scss']
})
export class PojokUntungPartnersTemplateEditComponent implements OnInit {
  public options: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Penjelasan");

  constructor() { }

  ngOnInit() {
  }

}
