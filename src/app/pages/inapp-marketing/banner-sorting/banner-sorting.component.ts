import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { BannerService } from 'app/services/inapp-marketing/banner.service';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { Observable, Subject } from 'rxjs';
import { BannerSortingPagination } from './banner-sorting.pagination';
import * as _ from 'underscore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-banner-sorting',
  templateUrl: './banner-sorting.component.html',
  styleUrls: ['./banner-sorting.component.scss']
})
export class BannerSortingComponent implements OnInit {

  draggable = {
    // note that data is handled with JSON.stringify/JSON.parse
    // only set simple data or POJO's as methods will be lost 
    data: "myDragData",
    effectAllowed: "all",
    disable: false,
    handle: false
  };
  sortedBanner = [
    // { id: 1, name: 'banner', image_url: 'https://image.com' },
    // { id: 2, name: 'banner', image_url: 'https://image.com' },
    // { id: 3, name: 'banner', image_url: 'https://image.com' },
    // { id: 4, name: 'banner', image_url: 'https://image.com' },
    // { id: 5, name: 'banner', image_url: 'https://image.com' },
  ];
  MAX_SLOT_BANNER = {
    'in-app-banner': 10,
    'info-terkini': 30,
    'aktivasi-konsumen': 30
  };
  TABLE_TITLE = {
    'in-app-banner': 'Spanduk Online',
    'info-terkini': 'Info Terkini',
    'aktivasi-konsumen': 'Aktivasi Konsumen',
  }
  layout = {
    container: "row",
    list: "row",
    dndHorizontal: true
  }


  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: BannerSortingPagination = new BannerSortingPagination();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;

  TYPE_BANNER = {
    DEFAULT: 'in-app-banner',
    INFO_TERKINI: 'info-terkini',
    AKTIVASI_KONSUMeN: 'aktivasi-konsumen'
  };
  listTypeBanner: any[] = [
    { name: "In-App Banner", value: "in-app-banner" },
    { name: "Info Terkini", value: "info-terkini" },
    { name: "Aktivasi Konsumen", value: "aktivasi-konsumen" }
  ];
  formSortBanner: FormGroup;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private bannerService: BannerService,
    private formBuilder: FormBuilder,
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.spanduk');


    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }
  ngOnInit() {
    this.formSortBanner = this.formBuilder.group({
      type_banner: [this.TYPE_BANNER.DEFAULT, Validators.required]
    });
    this.formSortBanner.get('type_banner').valueChanges.debounceTime(100).subscribe(newVal => {
      this.getBanner(true);
    });

    this.getBanner(true);
  }
  addSpace() {
    this.sortedBanner.push({id: this.sortedBanner.length+1, name: 'banner', image: 'https://image.com'});
  }
  remove(item, index) {
    this.sortedBanner.splice(index, 1);
  }
  
  onDrop(event:DndDropEvent, list?:any[]) {
  

    if (event.dropEffect === "copy" && list.length >= this.MAX_SLOT_BANNER[this.formSortBanner.get('type_banner').value] ) {
      
      this.dialogService.openSnackBar({message: 'Slot Sudah Penuh!'});
      return;

    }

    const existBanner = list.findIndex(l => l.id === event.data.id);
    if (event.dropEffect === "copy" && existBanner >= 0) {
      this.dialogService.openSnackBar({message: 'Banner sudah ditambahkan!'});
      return;
    }

    if( list && (event.dropEffect === "copy" || event.dropEffect === "move") ) {

      let index = event.index;

      if( typeof index === "undefined" ) {
        index = list.length;
      }

      list.splice( index, 0, event.data );
      this.sortedBanner = list;
    }
  }
  onDragged( item:any, list:any[], effect:DropEffect ) {

    if( effect === "move" ) {

      const index = list.indexOf( item );
      list.splice( index, 1 );
      this.sortedBanner = list;
    }
  }

  updateFilter(string) {
    this.dataService.showLoading(true)
    this.loadingIndicator = true;
    this.pagination.search = string;
    this.pagination.ongoing = true;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.bannerService.get(this.pagination).subscribe(res => {
      BannerSortingPagination.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.dataService.showLoading(false);

      this.loadingIndicator = false;
    }, error => {
      this.dataService.showLoading(false);
    });
  }
  getBanner(initial = false) {
    this.dataService.showLoading(true)
    const page = (!initial) ? this.dataService.getFromStorage("page") : 1;
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination.ongoing = true;
    let typeBanner = this.formSortBanner.get('type_banner').value;
    this.pagination.type_banner = (typeBanner === this.TYPE_BANNER.DEFAULT) ? '' : typeBanner;

    this.offsetPagination = page ? (page - 1) : 0;

    this.bannerService.get(this.pagination).subscribe(
      res => {
        BannerSortingPagination.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.prepareSortingBanner(res.data);
        this.onLoad = false;
        this.loadingIndicator = false;
        this.dataService.showLoading(false)
      },
      err => {
        this.onLoad = false;
        this.dataService.showLoading(false)
      }
    );
  }
  prepareSortingBanner(listBanner) {
    const sortedBanner = listBanner.filter(banner => banner.urutan_prioritas);
    this.sortedBanner = [...sortedBanner];
  }
  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;      
    this.loadingIndicator = true;
    this.pagination.ongoing = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.bannerService.get(this.pagination).subscribe(res => {
      BannerSortingPagination.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }
  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.pagination.ongoing = true;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.bannerService.get(this.pagination).subscribe(res => {
      BannerSortingPagination.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }
  onSelect(event, item:any, list:any[], nativeCallback) {
    const {checked} = event;
    if (checked && this.sortedBanner.length < this.MAX_SLOT_BANNER[this.formSortBanner.get('type_banner').value]) {
      let index = list.findIndex((l) => l.id === item.id);

      if (!index) {
        index = list.length;
      }
      list.splice( index, 0, item );
      this.sortedBanner = list;
      
    }
    else if (checked && this.sortedBanner.length >= this.MAX_SLOT_BANNER[this.formSortBanner.get('type_banner').value]) {

      this.dialogService.openSnackBar({message: "Slot Sudah Penuh!"});
      event.checked = false;
      event.source.checked = false;

    }
    else {

      let index = list.findIndex((l) => l.id === item.id);
      list.splice(index, 1);
      this.sortedBanner = list;

    }
  }
  _onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

  }
  checkSelected(row) {
    const index = this.sortedBanner.findIndex((banner) => banner.id === row.id);
    if (index >= 0) return true;
    return false;
  }
  submit() {
    this.dataService.showLoading(true);
    let typeBanner = this.formSortBanner.get('type_banner').value;
    const payload = {
      id: _.pluck(this.sortedBanner, 'id'),
      type_banner: this.formSortBanner.get('type_banner').value
    };

    this.bannerService.updateSorting(payload).subscribe(response => {

      this.getBanner(true);

    }, error => {
      this.dataService.showLoading(false);
    });
  }

}
