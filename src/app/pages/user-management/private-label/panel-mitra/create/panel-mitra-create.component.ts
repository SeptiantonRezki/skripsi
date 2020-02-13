import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-panel-mitra-create',
  templateUrl: './panel-mitra-create.component.html',
  styleUrls: ['./panel-mitra-create.component.scss']
})
export class PanelMitraCreateComponent implements OnInit {
  onLoad: boolean;

  constructor(
  ) {
    this.onLoad = true;
  }

  ngOnInit() {

  }
}
