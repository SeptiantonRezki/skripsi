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
  MAX_SLOT_BANNER = 10;
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

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private bannerService: BannerService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.spanduk');
    console.log(this.permission);

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
    this.getBanner(true);
  }
  addSpace() {
    this.sortedBanner.push({id: this.sortedBanner.length+1, name: 'banner', image: 'https://image.com'});
  }
  remove(item, index) {
    this.sortedBanner.splice(index, 1);
  }
  
  onDragStart(event:DragEvent) {

    console.log("drag started", JSON.stringify(event, null, 2));
  }
  
  onDragEnd(event:DragEvent) {
    
    console.log("drag ended", JSON.stringify(event, null, 2));
  }
  
  onDraggableCopied(event:DragEvent) {
    
    console.log("draggable copied", JSON.stringify(event, null, 2));
  }
  
  onDraggableLinked(event:DragEvent) {
      
    console.log("draggable linked", JSON.stringify(event, null, 2));
  }
    
  onDraggableMoved(event:DragEvent) {
    
    console.log("draggable moved", JSON.stringify(event, null, 2));
  }
      
  onDragCanceled(event:DragEvent) {
    
    console.log("drag cancelled", JSON.stringify(event, null, 2));
  }
  
  onDragover(event:DragEvent) {
    
    console.log("dragover", JSON.stringify(event, null, 2));
  }
  
  onDrop(event:DndDropEvent, list?:any[]) {
  
    // console.log("dropped", JSON.stringify(event, null, 2));
    console.log('ITEM DROPED');
    console.log({event});

    if (event.dropEffect === "copy" && list.length >= this.MAX_SLOT_BANNER) {
      
      console.log('slot penuh');
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

    // this.currentDragEffectMsg = `Drag ended with effect "${effect}"!`;
    console.log({item, list,  effect})

    if( effect === "move" ) {

      const index = list.indexOf( item );
      console.log({index});
      list.splice( index, 1 );
      this.sortedBanner = list;
    }
    // else if ( effect === "copy") {
      
    //   const index = list.findIndex((l) => l.id === item.id);
    //   list.splice(index, 1);
    //   this.rows = list;

    // }
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
    console.log({event, item, list});
    const {checked} = event;
    if (checked && this.sortedBanner.length < this.MAX_SLOT_BANNER) {
      let index = list.findIndex((l) => l.id === item.id);

      if (!index) {
        index = list.length;
      }
      list.splice( index, 0, item );
      this.sortedBanner = list;
      console.log({index});
      
    }
    else if (checked && this.sortedBanner.length >= this.MAX_SLOT_BANNER) {

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

    console.log("Select Event", selected, this.selected);
  }
  checkSelected(row) {
    const index = this.sortedBanner.findIndex((banner) => banner.id === row.id);
    if (index >= 0) return true;
    return false;
  }
  submit() {
    this.dataService.showLoading(true);
    const payload = {id: _.pluck(this.sortedBanner, 'id') };
    console.log({payload});

    this.bannerService.updateSorting(payload).subscribe(response => {
      
      console.log({response});
      // this.dataService.showLoading(false);
      this.getBanner(true);

    }, error => {
      this.dataService.showLoading(false);
      console.log({error});
    });
  }

}
