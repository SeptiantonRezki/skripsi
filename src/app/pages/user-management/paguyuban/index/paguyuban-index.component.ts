import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PaguyubanService } from 'app/services/user-management/paguyuban.service';
import { PagesName } from 'app/classes/pages-name';

@Component({
  selector: 'app-paguyuban-index',
  templateUrl: './paguyuban-index.component.html',
  styleUrls: ['./paguyuban-index.component.scss']
})
export class PaguyubanIndexComponent {
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

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private paguyubanService: PaguyubanService,
    private formBuilder: FormBuilder,
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.paguyuban');
    console.log(this.permission);

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
    // this._fuseSplashScreenService.show();
    // this.http.get("api/ayo-b2b-user").subscribe((contacts: any) => {
    //   this.rows = contacts;
    //   this.loadingIndicator = false;
    // });
    // setTimeout(() => {
    //     this._fuseSplashScreenService.hide();
    // }, 3000);
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
    this.getPaguyubanList();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(() => {
      this.getPaguyubanList();
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
          this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
            this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
            this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
            this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
            this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
            this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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

  getPaguyubanList() {
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({key, value})).filter(item => item.value !== "");
    this.pagination.area = areaSelected[areaSelected.length-1].value;
    this.loadingIndicator = true;
    // this.pagination.sort = "name";
    // this.pagination.sort_type = "asc";

    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.paguyubanService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data.map(item => {
          const principal = item.users.filter(item => item.type === "principal");
          const paguyuban = item.users.filter(item => item.type === "paguyuban")[0];
          return {
            ...item,
            paguyuban: paguyuban,
            principal_id: principal.length > 0 ? principal[0]['id'] : "",
            area: item.areas[0]['name'],
            area_id: item.areas[0]['id']
          }
        });
        
        this.onLoad = false;
        this.loadingIndicator = false;
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

    this.paguyubanService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        const principal = item.users.filter(item => item.type === "principal");
        const paguyuban = item.users.filter(item => item.type === "paguyuban")[0];
        return {
          ...item,
          paguyuban: paguyuban,
          principal_id: principal.length > 0 ? principal[0]['id'] : "",
          area: item.areas[0]['name'],
          area_id: item.areas[0]['id']
        }
      });

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

    this.paguyubanService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        const principal = item.users.filter(item => item.type === "principal");
        const paguyuban = item.users.filter(item => item.type === "paguyuban")[0];
        return {
          ...item,
          paguyuban: paguyuban,
          principal_id: principal.length > 0 ? principal[0]['id'] : "",
          area: item.areas[0]['name'],
          area_id: item.areas[0]['id']
        }
      });

      this.loadingIndicator = false;
    });
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

    this.paguyubanService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        const principal = item.users.filter(item => item.type === "principal");
        const paguyuban = item.users.filter(item => item.type === "paguyuban")[0];
        return {
          ...item,
          paguyuban: paguyuban,
          principal_id: principal.length > 0 ? principal[0]['id'] : "",
          area: item.areas[0]['name'],
          area_id: item.areas[0]['id']
        }
      });

      this.loadingIndicator = false;
    });
  }

  deletePaguyuban(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Paguyuban",
      captionDialog: "Apakah anda yakin untuk menghapus Paguyuban ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.paguyubanService.delete({ paguyuban_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getPaguyubanList();
        this.selected = [];
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    // let navigationExtras: NavigationExtras = {
    //   queryParams: param
    // }
    this.dataService.setToStorage("detail_paguyuban", param);
    this.router.navigate(["user-management", "paguyuban", "edit"]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_paguyuban", param);
    this.router.navigate(["user-management", "paguyuban", "detail"]);
  }

  deleteAllPaguyuban(): void {
    if (this.selected.length > 0) {
      let data = {
        titleDialog: "Hapus Paguyuban",
        captionDialog: "Apakah anda yakin untuk menghapus data yang telah dipilih ?",
        confirmCallback: this.confirmAllDelete.bind(this),
        buttonText: ["Hapus", "Batal"]
      };
      this.dialogService.openCustomConfirmationDialog(data);
    } else {
      this.dialogService.openSnackBar({ message: 'Tidak ada paguyuban yang dipilih'})
    }
  }

  confirmAllDelete() {
    let body = {
      ids: this.selected.map(item => item.id)
    }

    this.paguyubanService.deleteMultiple(body).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getPaguyubanList();
        this.selected = [];
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

}
