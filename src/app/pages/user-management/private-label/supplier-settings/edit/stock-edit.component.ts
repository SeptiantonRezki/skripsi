import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Page } from 'app/classes/laravel-pagination';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DialogService } from 'app/services/dialog.service';
import { Emitter } from 'app/helper/emitter.helper';
import { PLStockService } from 'app/services/user-management/private-label/stock.service';
import { GeotreeService } from 'app/services/geotree.service';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-stock-edit',
  templateUrl: './stock-edit.component.html',
  styleUrls: ['./stock-edit.component.scss']
})
export class StockEditComponent implements OnInit, OnDestroy {
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  verticalStepperStep3: FormGroup;

  onLoad: boolean;
  isLoadingSave: boolean;
  isDetail: boolean;
  listLevelArea: any[];
  list: any;
  areaFromLogin;
  loadingIndicator = true;
  pagination: Page = new Page();
  offsetPagination: Number = null;
  selected: any[] = [];
  allRowsSelected: boolean;

  rows: any[];
  listRole: Array<any>;
  supplierCompanyList: Array<any>;
  detailUserSupplier: any;
  userSupplierStatusSelected: any;
  userSupplierId: any;
  userSupplierStatusList: any[] = [
    { name: 'Aktif', status: 'active' },
    { name: 'Non-Aktif', status: 'inactive' }
  ];
  stockData: any;
  stockId: any;
  formStock: FormGroup;
  formFilter: FormGroup;
  checkAll: boolean;
  checkedDataIds: any[];

  private _onDestroy = new Subject<void>();

  @Output()
  onRowsSelected = new EventEmitter<any>();

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private stockService: PLStockService,
    private dialogService: DialogService,
    private router: Router,
    private emitter: Emitter,
    private dataService: DataService,
    private geotreeService: GeotreeService,
  ) {
    this.onLoad = true;
    this.isLoadingSave = false;
    this.stockData = null;
    this.checkAll = false;

    this.activatedRoute.url.subscribe(param => {
      this.isDetail = param[1].path === 'detail' ? true : false;
      this.stockId = param[2].path;
    });

    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SLSNTL"
      }
    ];

    this.list = {
      zone: [],
      region: []
    }

    this.emitter.listenStockDataEmitter
    .pipe(takeUntil(this._onDestroy))
    .subscribe(async(data: any) => {
      if (data.ubah && this.formStock) {
        this.stockData = data.data;
        if (this.stockData.settings && this.stockData.settings.length > 0) {
          const listStock = this.formStock.controls['listStock'] as FormArray;
          while (listStock.length > 0) {
            listStock.removeAt(listStock.length - 1);
            listStock.reset();
          }
          setTimeout(async() => {
            let i = 0;
            await this.stockData.settings.forEach((element: any, index: any) => {
              if (index < 7) {
                listStock.push(this.formBuilder.group({ name: element.name, value: element.value }));
                if (!this.packsConvertion(element.name)) {
                  if (element.value) {
                    i++;
                  }
                }
              }
            });
            console.log('i', i)
            if (i === 4) { this.checkAll = true;
            } else { this.checkAll = false; }
          }, 1000);
        }
      }
    });

  }

  async ngOnInit() {
    this.formStock = this.formBuilder.group({
      listStock: this.formBuilder.array([])
    });

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""]
    })

    this.formFilter.controls["national"].setValue(this.listLevelArea[0].id);
    this.formFilter.controls["national"].disable();
    this.getZoneList();
    this.getGeotreeTableList(true, true);

    this.formFilter.controls["zone"].valueChanges.debounceTime(1000).subscribe(() => {
      this.getRegionList();
      this.resetPagination();
      this.getGeotreeTableList();
    });

    this.formFilter.controls["region"].valueChanges.debounceTime(1000).subscribe(() => {
      this.resetPagination();
      this.getGeotreeTableList();
    });

    this.formStock.controls['listStock'].valueChanges.debounceTime(300).subscribe(res => {
      (res || []).map(async(item: any, index: number) => {
        const fpm = this.formStock.getRawValue();
        let i = 0;
        await fpm.listStock.forEach((element: any) => {
          if (!this.packsConvertion(element.name)) {
            if (element.value) { i++; }
          }
        });
        if (i >= fpm.listStock.length) { this.checkAll = true;
        } else { this.checkAll = false; }
      });
    });

    setTimeout(() => {
      if (!this.stockData) {
        this.router.navigate(['user-management', 'supplier-settings']);
      }
    }, 1000);

  }
  
  resetPagination() {
    this.pagination.page = 1;
    this.dataService.setToStorage("page_stock", this.pagination.page);
  }

  loadChecklistGeotree() {
      this.pagination.search = '';
      this.dataService.showLoading(true);
      this.stockService.check({ product_id: this.stockId }).subscribe(res => {
        console.log('res', res);
        this.checkedDataIds = (res.data || []).map(item => item.area_id);
        this.refineSelectedRow();
        this.dataService.showLoading(false);
    });
  }

  getZoneList() {
    this.geotreeService.getChildFilterArea({area_id: [1], area_type: "division"}).subscribe(res => {
      if (res && res.data && res.status === 'success') {
        this.list['zone'] = res.data;
      }
    });
  }

  getRegionList() {
    if (!this.formFilter.controls.zone.value || this.formFilter.controls.zone.value.length == 0) {
      this.list['region'] = [];
      return;
    }
    this.geotreeService.getChildFilterArea({area_id: this.formFilter.controls.zone.value, area_type: "region"}).subscribe(res => {
      if (res && res.data && res.status === 'success') {
        this.list['region'] = res.data;
      }
      this.getGeotreeTableList();
    });
  }

  refineFilters() {
    if (!this.formFilter.controls.region.value) {
      return;
    }
    let availableRegionIds = this.list['region'].map(region => {
      return region.id;
    });

    let filteredRegions = this.formFilter.controls.region.value.filter(id => {
      return availableRegionIds.indexOf(id) != -1;
    });

    this.formFilter.controls.region.setValue(filteredRegions, {emitEvent:false});
  }

  getGeotreeTableList(loadChecked?, resetPage?) {
    this.loadingIndicator = true;
    // if (!this.formFilter.controls.zone.value || !this.formFilter.controls.region.value || this.formFilter.controls.zone.value.lenght == 0 || this.formFilter.controls.region.value.length == 0) {
    //   this.rows = [];
    //   this.loadingIndicator = false;
    //   return;
    // }

    const page = this.dataService.getFromStorage("page_stock");
    const sort_type = this.dataService.getFromStorage("sort_type_stock");
    const sort = this.dataService.getFromStorage("sort_stock");

    this.pagination.page = resetPage ? 1 : page;
    this.dataService.setToStorage("page_stock", this.pagination.page);
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = this.dataService.getFromStorage("page_stock") ? (this.dataService.getFromStorage("page_stock") - 1) : 0;
    this.refineFilters();
    let queryParams = {
      ...this.pagination, 
      area: this.formFilter.controls['region'].value && this.formFilter.controls['region'].value.length ? this.formFilter.controls['region'].value : [1]
    };
    this.stockService.getDataTable(queryParams).subscribe(res => {
      if (res && res.data && res.data.data && res.status === 'success') {
        this.rows = res.data.data;
        this.pagination.total = res.data.total;
        this.refineSelectedRow();
      } 
      if (loadChecked) {
        this.loadChecklistGeotree();
      }
      this.loadingIndicator = false;
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;
    this.dataService.showLoading(true);

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page_stock", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page_stock");
    }

    let queryParams = {
      ...this.pagination, 
      area: this.formFilter.controls['region'].value && this.formFilter.controls['region'].value.length ? this.formFilter.controls['region'].value : [1]
    };
    this.stockService.getDataTable(queryParams).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.pagination.total = res.data.total;
      this.refineSelectedRow();
      this.dataService.showLoading(false);
      this.loadingIndicator = false;
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page_stock", this.pagination.page);
    this.dataService.setToStorage("sort_stock", event.column.prop);
    this.dataService.setToStorage("sort_type_stock", event.newValue);

    let queryParams = {
      ...this.pagination, 
      area: this.formFilter.controls['region'].value && this.formFilter.controls['region'].value.length ? this.formFilter.controls['region'].value : [1]
    };
    this.stockService.getDataTable(queryParams).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data ? res.data : [];
      this.refineSelectedRow();
      this.loadingIndicator = false;
    });
  }

  onSelect({selected}) {
    // this.selected.splice(0, this.selected.length);
    // this.selected.push(...selected);
    // this.onRowsSelected.emit({ isSelected: true, data: selected });
    this.checkedDataIds = (selected || []).map(item => item.id);
    console.log('selected data >>> ', this.selected);
  }

  selectFn(allRowsSelected: boolean) {
    console.log('allRowsSelected_', allRowsSelected);
    this.allRowsSelected = allRowsSelected;
    // this.onRowsSelected.emit({ allRowsSelected: allRowsSelected });
    if (!allRowsSelected) {
      this.selected = [];
    } else {
      this.selected = this.rows;
      console.log('selected ALL data >>> ', this.selected);
    }
  }

  submit() {
      if (this.selected.length === 0) {
        this.dialogService.openSnackBar({
          message: "Geotree yang dipilih tidak boleh kosong!"
        });
        return;
      }

      this.dataService.showLoading(true);
      let body = {
        product_id: this.stockId,
        area_id: this.selected.map(item => { return item.id; })
      };

      console.log('my body', body);

      this.dataService.showLoading(false);

      this.stockService.updateGeotree(body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan"
        });
        // this.router.navigate(['user-management', 'supplier-settings']);

      }, err => {
        console.log('err stock count geotree', err);

        this.dataService.showLoading(false);
      })
  }

  refineSelectedRow() {
    let allSelectedIds = this.selected.map(item => item.id).concat(this.checkedDataIds);
    // remove duplicate ids
    allSelectedIds = allSelectedIds.filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });
    this.selected = (allSelectedIds || []).map(id => {
      let foundItem = this.rows.find(row => row.id === id);
      return foundItem || {id: id};
    }).filter(item => item.id !== undefined && item.id !== null);
  }

  selectionAll(event) {
    console.log('event', event.checked);
    const checked = event.checked;
    const listStock = this.formStock.controls['listStock'] as FormArray;
    // while (listStock.length > 0 && listStock.length < 4) {
    //   listStock.removeAt(listStock.length - 4);
    // }
    this.stockData.settings.forEach((element: any, index: number) => {
      if (!this.packsConvertion(element.name)) {
        // listStock.push(this.formBuilder.group({ name: element.name, value: checked }));
        listStock.at(index).setValue({ name: element.name, value: checked });
      }
    });
  }

  async onSave() {
    const body = new FormData();
    const fpm = this.formStock.getRawValue();
    await fpm.listStock.forEach((item: any, index: number) => {
      body.append(`settings[${index}][name]`, item.name);
      if (!this.packsConvertion(item.name)) {
        body.append(`settings[${index}][value]`, item.value ? '1' : '0' );
      } else {
        body.append(`settings[${index}][value]`, item.value ? item.value : 0 );
      }
    });

    this.dataService.showLoading(true);
    this.stockService.update(body, { id: this.stockId }).subscribe(res => {
      this.dialogService.openSnackBar({
        message: 'Berhasil Menyimpan Data'
      });
      this.router.navigate(['user-management', 'supplier-settings']);
      this.dataService.showLoading(false);
      }, err => {
        console.log('err', err);
        this.dialogService.openSnackBar({
          message: err.error.message
        });
        this.dataService.showLoading(false);
      }
    );

  }

  packsConvertion = (name: String) => {
    if (name === 'packs_per_box' ||
        name === 'packs_per_bale' ||
        name === 'packs_per_slop') {
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

}
