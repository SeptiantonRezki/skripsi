import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-orderto-supplier-detail',
  templateUrl: './orderto-supplier-detail.component.html',
  styleUrls: ['./orderto-supplier-detail.component.scss']
})
export class OrdertoSupplierDetailComponent implements OnInit {
  onLoad: boolean;

  constructor(
  ) {
    this.onLoad = true;
  }

  ngOnInit() {

  }
}
