import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { CustomerService } from 'app/services/user-management/customer.service';
import { GeneralService } from "app/services/general.service";

@Component({
  selector: 'app-customer-index',
  templateUrl: './customer-index.component.html',
  styleUrls: ['./customer-index.component.scss']
})
export class CustomerIndexComponent {
  formFilterCustomer: FormGroup;
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

  offsetPagination: any;
  listStatus: any[] = [{ name: 'Semua Status', value: '-1' }, { name: 'Status Aktif', value: 'active' }, { name: 'Status Non Aktif', value: 'inactive' }];
  listVersions: any[] = [];
  listCities: any[] = [];
  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private generalService: GeneralService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
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
    this.getVersions();
    this.getCities();
    // this.fuseSplashScreen.show();
    this.formFilterCustomer = this.formBuilder.group({
      city: [""],
      version: [""],
      status: [""]
    });

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.getCustomerList();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(() => {
      this.getCustomerList();
    })

    this.formFilterCustomer.get('status').valueChanges.subscribe(res => {
      this.getCustomerList();
    })

    this.formFilterCustomer.get('version').valueChanges.subscribe(res => {
      this.getCustomerList();
    })

    this.formFilterCustomer.get('city').valueChanges.subscribe(res => {
      this.getCustomerList();
    })
  }

  getVersions() {
    this.generalService.getAppVersions({ type: 'customer' }).subscribe(res => {
      this.listVersions = [{ version: 'Semua Versi' }, ...res];
    })
  }

  getCities() {
    this.generalService.getCities({ type: 'customer', area: 1 }).subscribe(res => {
      // this.listCities = [{  }]
      this.listCities = [{ name: 'Semua Kota', id: -1 }];
      this.listCities = [
        ...this.listCities,
        ...res.data
      ]
    })
  }

  getCustomerList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.loadingIndicator = true;
    this.pagination['status'] = this.formFilterCustomer.get('status').value;
    this.pagination['version'] = this.formFilterCustomer.get('version').value;
    this.pagination['city'] = this.formFilterCustomer.get('city').value

    if (this.formFilterCustomer.get('version').value === 'Semua Versi') this.pagination['version'] = null;
    if (this.formFilterCustomer.get('status').value === '-1') this.pagination['status'] = null;
    if (this.formFilterCustomer.get('city').value === '-1') this.pagination['city'] = null;

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
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

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

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

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
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

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
