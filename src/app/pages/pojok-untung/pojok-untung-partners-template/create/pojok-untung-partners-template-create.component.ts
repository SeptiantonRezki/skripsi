import { Component, OnInit } from '@angular/core';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-pojok-untung-partners-template-create',
  templateUrl: './pojok-untung-partners-template-create.component.html',
  styleUrls: ['./pojok-untung-partners-template-create.component.scss']
})
export class PojokUntungPartnersTemplateCreateComponent implements OnInit {
  public options: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Penjelasan");

  constructor() { }

  ngOnInit() {
  }

}
