import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { CustomerService } from 'app/services/user-management/customer.service';

@Component({
  selector: 'app-customer-index',
  templateUrl: './customer-index.component.html',
  styleUrls: ['./customer-index.component.scss']
})
export class CustomerIndexComponent {

  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  filterArea: Boolean;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
  ) {
    this.onLoad = true;
    this.selected = [];

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
    // this.fuseSplashScreen.show();
    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    // this.initArea();
    this.getCustomerList();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(() => {
      this.getCustomerList();
    })
  }

  // initArea() {
  //   this.areaFromLogin.map(item => {
  //     let level_desc = '';
  //     switch (item.type.trim()) {
  //       case 'national':
  //         level_desc = 'zone';
  //         this.formFilter.get('national').setValue(item.id);
  //         this.formFilter.get('national').disable();
  //         break
  //       case 'division':
  //         level_desc = 'region';
  //         this.formFilter.get('zone').setValue(item.id);
  //         this.formFilter.get('zone').disable();
  //         break;
  //       case 'region':
  //         level_desc = 'area';
  //         this.formFilter.get('region').setValue(item.id);
  //         this.formFilter.get('region').disable();
  //         break;
  //       case 'area':
  //         level_desc = 'salespoint';
  //         this.formFilter.get('area').setValue(item.id);
  //         this.formFilter.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         level_desc = 'district';
  //         this.formFilter.get('salespoint').setValue(item.id);
  //         this.formFilter.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         level_desc = 'territory';
  //         this.formFilter.get('district').setValue(item.id);
  //         this.formFilter.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formFilter.get('territory').setValue(item.id);
  //         this.formFilter.get('territory').disable();
  //         break;
  //     }
  //     this.getAudienceArea(level_desc, item.id);
  //   });
  // }

  // getAudienceArea(selection, id) {
  //   let item: any;
  //   switch (selection) {
  //     case 'zone':
  //         this.customerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //           this.list[selection] = res;
  //         });

  //         this.formFilter.get('region').setValue('');
  //         this.formFilter.get('area').setValue('');
  //         this.formFilter.get('salespoint').setValue('');
  //         this.formFilter.get('district').setValue('');
  //         this.formFilter.get('territory').setValue('');
  //         this.list['region'] = [];
  //         this.list['area'] = [];
  //         this.list['salespoint'] = [];
  //         this.list['district'] = [];
  //         this.list['territory'] = [];
  //       break;
  //     case 'region':
  //         item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.customerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res;
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formFilter.get('region').setValue('');
  //         this.formFilter.get('area').setValue('');
  //         this.formFilter.get('salespoint').setValue('');
  //         this.formFilter.get('district').setValue('');
  //         this.formFilter.get('territory').setValue('');
  //         this.list['area'] = [];
  //         this.list['salespoint'] = [];
  //         this.list['district'] = [];
  //         this.list['territory'] = [];
  //       break;
  //     case 'area':
  //         item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.customerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res;
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formFilter.get('area').setValue('');
  //         this.formFilter.get('salespoint').setValue('');
  //         this.formFilter.get('district').setValue('');
  //         this.formFilter.get('territory').setValue('');
  //         this.list['salespoint'] = [];
  //         this.list['district'] = [];
  //         this.list['territory'] = [];
  //       break;
  //     case 'salespoint':
  //         item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.customerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res;
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formFilter.get('salespoint').setValue('');
  //         this.formFilter.get('district').setValue('');
  //         this.formFilter.get('territory').setValue('');
  //         this.list['district'] = [];
  //         this.list['territory'] = [];
  //       break;
  //     case 'district':
  //         item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.customerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res;
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formFilter.get('district').setValue('');
  //         this.formFilter.get('territory').setValue('');
  //         this.list['territory'] = [];
  //       break;
  //     case 'territory':
  //         item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.customerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res;
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formFilter.get('territory').setValue('');
  //       break;
    
  //     default:
  //       break;
  //   }
  // }

  getCustomerList() {
    // let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({key, value})).filter(item => item.value !== "");
    // this.pagination.area = areaSelected[areaSelected.length-1].value;
    this.pagination.sort = "fullname";
    this.pagination.sort_type = "asc";
      
    this.loadingIndicator = true;
    this.customerService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.onLoad = false;
        this.loadingIndicator = false;

        // this.fuseSplashScreen.hide();
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    console.log("Select Event", selected, this.selected);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.customerService.get(this.pagination).subscribe(res => {
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

    this.customerService.get(this.pagination).subscribe(
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

    console.log(this.pagination);

    this.customerService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_wholesaler", param);
    this.router.navigate(["user-management", "wholesaler", "edit"]);
  }

}