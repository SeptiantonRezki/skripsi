import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { Page } from "app/classes/laravel-pagination";
import { Subject, Observable } from "../../../../../../node_modules/rxjs";
import { DatatableComponent } from "../../../../../../node_modules/@swimlane/ngx-datatable";
import { Router } from "../../../../../../node_modules/@angular/router";
import { DialogService } from "app/services/dialog.service";
import { DataService } from "app/services/data.service";
import { WholesalerService } from "../../../../services/user-management/wholesaler.service";
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FormGroup, FormBuilder } from "@angular/forms";
import { PagesName } from "app/classes/pages-name";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-wholesaler-index",
  templateUrl: "./wholesaler-index.component.html",
  styleUrls: ["./wholesaler-index.component.scss"]
})
export class WholesalerIndexComponent {
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
  area_id_list: any = [];

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private fuseSplashScreen: FuseSplashScreenService,
    private wholesalerService: WholesalerService,
    private formBuilder: FormBuilder,
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.wholesaler');
    console.log(this.permission);

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
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

    this.initArea();
    this.getWholesalerList();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(() => {
      this.getWholesalerList();
    })
  }

  initArea() {
    this.areaFromLogin.map(area_types => {
      area_types.map((item, index) => {
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
            if (index !== area_types.length - 1) this.formFilter.get('zone').disable();
            break;
          case 'region':
            level_desc = 'area';
            this.formFilter.get('region').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('region').disable();
            break;
          case 'area':
            level_desc = 'salespoint';
            this.formFilter.get('area').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('area').disable();
            break;
          case 'salespoint':
            level_desc = 'district';
            this.formFilter.get('salespoint').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('salespoint').disable();
            break;
          case 'district':
            level_desc = 'territory';
            this.formFilter.get('district').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('district').disable();
            break;
          case 'territory':
            this.formFilter.get('territory').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('territory').disable();
            break;
        }
        this.getAudienceArea(level_desc, item.id);
      });
    });
    // this.areaFromLogin.map(item => {
    //   let level_desc = '';
    //   switch (item.type.trim()) {
    //     case 'national':
    //       level_desc = 'zone';
    //       this.formFilter.get('national').setValue(item.id);
    //       this.formFilter.get('national').disable();
    //       break
    //     case 'division':
    //       level_desc = 'region';
    //       this.formFilter.get('zone').setValue(item.id);
    //       this.formFilter.get('zone').disable();
    //       break;
    //     case 'region':
    //       level_desc = 'area';
    //       this.formFilter.get('region').setValue(item.id);
    //       this.formFilter.get('region').disable();
    //       break;
    //     case 'area':
    //       level_desc = 'salespoint';
    //       this.formFilter.get('area').setValue(item.id);
    //       this.formFilter.get('area').disable();
    //       break;
    //     case 'salespoint':
    //       level_desc = 'district';
    //       this.formFilter.get('salespoint').setValue(item.id);
    //       this.formFilter.get('salespoint').disable();
    //       break;
    //     case 'district':
    //       level_desc = 'territory';
    //       this.formFilter.get('district').setValue(item.id);
    //       this.formFilter.get('district').disable();
    //       break;
    //     case 'territory':
    //       this.formFilter.get('territory').setValue(item.id);
    //       this.formFilter.get('territory').disable();
    //       break;
    //   }
    //   this.getAudienceArea(level_desc, item.id);
    // });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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

  filteringGeotree(areaList) {
    let filteredArea = areaList.slice(1, areaList.length).filter(ar => this.area_id_list.includes(Number(ar.id)));
    if (areaList && areaList[0]) filteredArea.unshift(areaList[0]);
    return filteredArea.length > 1 ? filteredArea : areaList;
  }

  getWholesalerList() {
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    // this.pagination.sort = "name";
    // this.pagination.sort_type = "asc";

    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.loadingIndicator = true;
    this.wholesalerService.get(this.pagination).subscribe(
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

    this.wholesalerService.get(this.pagination).subscribe(res => {
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

    this.wholesalerService.get(this.pagination).subscribe(
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

    this.wholesalerService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  deleteWholesaler(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Wholesaler",
      captionDialog: "Apakah anda yakin untuk menghapus Wholesaler ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.wholesalerService.delete({ wholesaler_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getWholesalerList();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    // this.dataService.setToStorage("detail_wholesaler", param);
    this.dataService.setToStorage("id_wholesaler", param.id);
    this.router.navigate(["user-management", "wholesaler", "edit"]);
  }

  directDetail(param?: any): void {
    // this.dataService.setToStorage("detail_wholesaler", param);
    this.dataService.setToStorage("id_wholesaler", param.id);
    this.router.navigate(["user-management", "wholesaler", "detail"]);
  }

  async export() {
    this.dataService.showLoading(true);
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    let area_id = areaSelected[areaSelected.length - 1].value;
    console.log('area you selected', area_id, areaSelected[areaSelected.length - 1]);
    try {
      const response = await this.wholesalerService.exportWholesaler({ area_id: area_id }).toPromise();
      console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_Wholesaler_${new Date().toLocaleString()}.xlsx`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  handleError(error) {
    console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }
}
