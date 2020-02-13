import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';

import { Endpoint } from '../../../../../classes/endpoint';

@Component({
  selector: 'app-panel-mitra-index',
  templateUrl: './panel-mitra-index.component.html',
  styleUrls: ['./panel-mitra-index.component.scss']
})
export class PanelMitraIndexComponent implements OnInit {
  onLoad: boolean;

  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  offsetPagination: any;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private dataService: DataService,
  ) {
    this.onLoad = false;
  }

  ngOnInit() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.rows = [
      {
        id: 21,
        name: 'PT Bintang Toedjoeh',
        address: 'Jl. Sumatera No. 123 Pondok Bambu Jakarta Timur, DKI Jakarta, Indonesia',
        phone: '08123456789',
        status: 'active',
      },
      {
        id: 211,
        name: 'PT Bintang Toedjoeh2',
        address: 'Jl. Sumatera No. 123A Pondok Bambu Jakarta Timur, DKI Jakarta, Indonesia',
        phone: '081234567891',
        status: 'active',
      }
    ];
    const res = {
      current_page: 1,
      first_page_url: "https://dev.ayo-api.dxtr.asia/api/principal/user/principal-partnership?page=1",
      from: 1,
      last_page: 7,
      last_page_url: "https://dev.ayo-api.dxtr.asia/api/principal/user/principal-partnership?page=7",
      next_page_url: "https://dev.ayo-api.dxtr.asia/api/principal/user/principal-partnership?page=2",
      path: "https://dev.ayo-api.dxtr.asia/api/principal/user/principal-partnership",
      per_page: "15",
      prev_page_url: null,
      to: 15,
      total: 98,
    }
    Page.renderPagination(this.pagination, res);
  }
}
