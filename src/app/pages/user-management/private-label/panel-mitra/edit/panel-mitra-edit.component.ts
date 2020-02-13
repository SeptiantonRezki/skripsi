import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-panel-mitra-edit',
  templateUrl: './panel-mitra-edit.component.html',
  styleUrls: ['./panel-mitra-edit.component.scss']
})
export class PanelMitraEditComponent implements OnInit {
  onLoad: boolean;

  constructor(
  ) {
    this.onLoad = true;
  }

  ngOnInit() {

  }
}
