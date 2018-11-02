import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoinService } from 'app/services/sku-management/coin.service';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-coin-index',
  templateUrl: './coin-index.component.html',
  styleUrls: ['./coin-index.component.scss']
})
export class CoinIndexComponent {

  listLevelArea: any[];
  list: any;
  areaFromLogin;

  formFilter: FormGroup;

  rows: any[];
  rowsTP: any[];
  selected: any[];
  id: any[];

  retailer_id: any;
  type: any;
  selectedTab: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  loadingIndicatorTP = true;
  reorderableTP = true;
  paginationTP: Page = new Page();
  onLoadTP: boolean;

  keyUp = new Subject<string>();
  keyUpTP = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  constructor(
    private dialogService: DialogService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private coinService: CoinService
  ) { 
    this.onLoad = true;
    this.onLoadTP = true;

    const selectedTab = this.dataService.getFromStorage('setSelectedTabCoin');
    if (selectedTab) {
      this.selectedTab = selectedTab;
    } else {
      this.selectedTab = 0;
    }

    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];
    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "Sales National"
      }
    ];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });

    this.keyUpTP.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilterTP(data);
      });
  }

  ngOnInit() {
    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.initArea();
    this.getRetailer();
    this.getTrade();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(() => {
      this.getRetailer();
    })
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.formFilter.get('national').setValue(item.id);
          this.formFilter.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.formFilter.get('zone').setValue(item.id);
          this.formFilter.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.formFilter.get('region').setValue(item.id);
          this.formFilter.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.formFilter.get('area').setValue(item.id);
          this.formFilter.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.formFilter.get('salespoint').setValue(item.id);
          this.formFilter.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.formFilter.get('district').setValue(item.id);
          this.formFilter.get('district').disable();
          break;
        case 'territory':
          this.formFilter.get('territory').setValue(item.id);
          this.formFilter.get('territory').disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
          this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });

          this.formFilter.get('region').setValue('');
          this.formFilter.get('area').setValue('');
          this.formFilter.get('salespoint').setValue('');
          this.formFilter.get('district').setValue('');
          this.formFilter.get('territory').setValue('');
          this.list['region'] = [];
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'region':
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formFilter.get('region').setValue('');
          this.formFilter.get('area').setValue('');
          this.formFilter.get('salespoint').setValue('');
          this.formFilter.get('district').setValue('');
          this.formFilter.get('territory').setValue('');
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'area':
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formFilter.get('area').setValue('');
          this.formFilter.get('salespoint').setValue('');
          this.formFilter.get('district').setValue('');
          this.formFilter.get('territory').setValue('');
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'salespoint':
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formFilter.get('salespoint').setValue('');
          this.formFilter.get('district').setValue('');
          this.formFilter.get('territory').setValue('');
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'district':
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formFilter.get('district').setValue('');
          this.formFilter.get('territory').setValue('');
          this.list['territory'] = [];
        break;
      case 'territory':
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formFilter.get('territory').setValue('');
        break;
    
      default:
        break;
    }
  }

  getRetailer() {
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({key, value})).filter(item => item.value !== "");
    this.pagination.area = areaSelected[areaSelected.length-1].value;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';

    this.loadingIndicator = true;
    this.coinService.getRetailer(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.coinService.getRetailer(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log("check pagination", this.pagination);

    this.coinService.getRetailer(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
      },
      err => {
        this.loadingIndicator = false;
      }
    );
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    this.coinService.getRetailer(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  getTrade() {
    this.paginationTP.sort = 'name';
    this.paginationTP.sort_type = 'asc';
    this.loadingIndicatorTP = true;
    this.coinService.getProgram(this.paginationTP).subscribe(
      res => {
        Page.renderPagination(this.paginationTP, res);
        this.rowsTP = res.data;
        this.onLoadTP = false;
        this.loadingIndicatorTP = false;
      },
      err => {
        console.error(err);
        this.onLoadTP = false;
      }
    );
  }

  setPageTP(pageInfo) {
    this.loadingIndicatorTP = true;
    this.paginationTP.page = pageInfo.offset + 1;

    this.coinService.getProgram(this.paginationTP).subscribe(res => {
      Page.renderPagination(this.paginationTP, res);
      this.rowsTP = res.data;
      this.loadingIndicatorTP = false;
    });
  }

  onSortTP(event) {
    this.paginationTP.sort = event.column.prop;
    this.paginationTP.sort_type = event.newValue;
    this.paginationTP.page = 1;
    this.loadingIndicatorTP = true;

    console.log("check pagination", this.paginationTP);

    this.coinService.getProgram(this.paginationTP).subscribe(
      res => {
        Page.renderPagination(this.paginationTP, res);
        this.rowsTP = res.data;
        this.loadingIndicatorTP = false;
      },
      err => {
        this.loadingIndicatorTP = false;
      }
    );
  }

  updateFilterTP(string) {
    this.loadingIndicatorTP = true;
    this.table.offset = 0;
    this.paginationTP.search = string;
    this.paginationTP.page = 1;

    this.coinService.getProgram(this.paginationTP).subscribe(res => {
      Page.renderPagination(this.paginationTP, res);
      this.rowsTP = res.data;
      this.loadingIndicatorTP = false;
    });
  }

  flush(type, item) {
    this.type = type;
    this.retailer_id = item.id;
    let data = {
      titleDialog: "Flush Coin",
      captionDialog: "Anda akan menghapus semua coin di "+ item.name +". Coin yang terhapus tidak akan bisa dikembalikan.",
      confirmCallback: this.confirmFlush.bind(this),
      buttonText: ["Ok", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmFlush() {
    let body = {
      type: this.type
    }

    if (this.type === 'retailer') 
      body['retailer_id'] = this.retailer_id;
    else 
      body['trade_program_id'] = this.retailer_id;

    this.coinService.flush(body).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Flush coin berhasil" });

        if (this.type === 'retailer') 
          this.getRetailer();
        else 
          this.getTrade();
      },
      err => {
        // this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  setToStorage(item, name) {
    this.dataService.setToStorage(name, item);
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    this.selectedTab = tabChangeEvent.index;
  }

}
