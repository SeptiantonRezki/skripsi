import { Component, OnInit } from '@angular/core';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-pojok-untung-partners-list-create',
  templateUrl: './pojok-untung-partners-list-create.component.html',
  styleUrls: ['./pojok-untung-partners-list-create.component.scss']
})
export class PojokUntungPartnersListCreateComponent implements OnInit {
  public options: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Detail Deskripsi");

  constructor() { }

  ngOnInit() {
  }

}
