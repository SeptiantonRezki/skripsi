import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PanelMitraService } from 'app/services/user-management/private-label/panel-mitra.service';
import { DialogService } from 'app/services/dialog.service';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { GeotreeService } from 'app/services/geotree.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { MatDialogConfig, MatDialog } from '@angular/material';

import { ImportPanelMitraDialogComponent } from '../dialog-import/import-panel-mitra-dialog.component';

@Component({
  selector: 'app-panel-mitra-edit',
  templateUrl: './panel-mitra-edit.component.html',
  styleUrls: ['./panel-mitra-edit.component.scss']
})
export class PanelMitraEditComponent implements OnInit {
  onLoad: boolean;
  @ViewChild('containerScroll') private myScrollContainer: ElementRef;

  rows: any[];
  selected: any[];
  id: any;
  listFilterCategory: any[];
  listFilterProducts: any[];
  listFilterSupplier: any[];
  // filterCategory: any[] = [ { name: 'Semua Kategori', id: '' }, ];
  // filterProducts: any[] = [ { name: 'Semua Produk', id: '' }, ];
  filterCategory: any[];
  filterProducts: any[];
  filterSupplier: any[];

  formInput: FormGroup;
  formFilter: FormGroup;
  filterProdukSearch = new FormControl();
  filterSupplierSearch = new FormControl();
  private _onDestroy = new Subject<void>();

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;
  allRowsSelected: boolean;
  // allRowsSelectedValid: boolean;
  allHubSelected = false;
  listFilterHub = [
    { name: 'All', value: '' },
    { name: 'Yes', value: '1' },
    { name: 'No', value: '0' },
  ];
  filterHub = new FormControl();

  isSelected: boolean;

  keyUp = new Subject<string>();
  permission: any;
  roles: PagesName = new PagesName();
  isDetail: boolean;
  panelMitraId: any;
  panelMitraDetail: null;

  areaFromLogin;
  area_id_list: any = [];
  listLevelArea: any[];
  list: any;
  area: Array<any>;
  lastLevel: any;
  endArea: String;
  wholesalerIds: any[] = [];
  dialogRef: any;
  totalData = 0;
  isSort = false;
  // defaultAreas is used for supplier type (if user don't have areas)
  defaultAreas: Array<any> = [ [ { 'id': 1, 'parent_id': null, 'code': 'SLSNTL      ', 'name': 'SLSNTL', 'level_desc': 'national', 'type': 'national' } ] ];
  defaultAreaType: Array<any> = [ { 'id': 1, 'parent_id': null, 'code': 'SLSNTL      ', 'name': 'SLSNTL', 'level_desc': 'national', 'type': 'national' } ];

  constructor(
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private panelMitraService: PanelMitraService,
      private dialogService: DialogService,
      private dataService: DataService,
      private geotreeService: GeotreeService,
      private router: Router,
      private dialog: MatDialog,
  ) {
      this.onLoad = false;
      this.selected = [];
      this.permission = this.roles.getRoles('principal.supplierpanelmitra');
      // console.log('snapshot', this.activatedRoute.snapshot.data);
      this.listFilterCategory = [ { name: 'Semua Kategori', id: '' }, ...this.activatedRoute.snapshot.data['listCategory'].data ];
      // this.listFilterSupplier = [ { name: 'Pilih Supplier', id: '' }, ...this.activatedRoute.snapshot.data["listSupplierCompany"].data.data ];
      this.filterCategory = this.listFilterCategory;
      // this.filterSupplier = this.listFilterSupplier;
      this.allRowsSelected = false;
      // this.allRowsSelectedValid = false;
      this.isSelected = false;
      this.activatedRoute.url.subscribe(param => {
        this.isDetail = param[1].path === 'detail' ? true : false;
        this.panelMitraId = param[2].path;
      });

      this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'] || this.defaultAreas;
      let area_id = this.dataService.getDecryptedProfile()['area_id'];
      area_id = (area_id) ? area_id : [1]; // default area_id if type is supplier (last selected area_id eq 1 which mean national)

      this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
      this.listLevelArea = [
        {
          'id': 1,
          'parent_id': null,
          'code': 'SLSNTL      ',
          'name': 'SSLSNTL'
        }
      ];
      this.list = {
        zone: [],
        region: [],
        area: [],
        salespoint: [],
        district: [],
        territory: []
      };
      this.area = dataService.getDecryptedProfile()['area_type'] || this.defaultAreaType;

    const observable = this.keyUp.debounceTime(1000)
    .distinctUntilChanged()
    .flatMap(search => {
      return Observable.of(search).delay(500);
    })
    .subscribe(data => {
      this.getListMitra(data);
    });
  }

    ngOnInit() {
      this.formInput = this.formBuilder.group({
        filtercategory: '',
        filterproduct: ['', Validators.required],
        filtersupplier: ['', Validators.required],
      });
      this.getFilterProduct();
      this.getDetails();

      this.formFilter = this.formBuilder.group({
        national: [''],
        zone: [''],
        region: [''],
        area: [''],
        salespoint: [''],
        district: [''],
        territory: ['']
      });

      this.initAreaV2();

      this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
        // this.getListMitra();
      });

      this.filterProdukSearch.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
        this.filteringProdukSearch();
      });

      this.filterHub.valueChanges.subscribe((v) => {
        this.getListMitra(null, v);
      });

      this.formFilter.get('zone').valueChanges.subscribe(res => {
        console.log('zone', res);
        if (res) {
          this.getAudienceAreaV2('region', res);
        }
      });
      this.formFilter.get('region').valueChanges.subscribe(res => {
        console.log('region', res);
        if (res) {
          this.getAudienceAreaV2('area', res);
        }
      });
      this.formFilter.get('area').valueChanges.subscribe(res => {
        console.log('area', res, this.formFilter.value['area']);
        if (res) {
          this.getAudienceAreaV2('salespoint', res);
        }
      });
      this.formFilter.get('salespoint').valueChanges.subscribe(res => {
        console.log('salespoint', res);
        if (res) {
          this.getAudienceAreaV2('district', res);
        }
      });
      this.formFilter.get('district').valueChanges.subscribe(res => {
        console.log('district', res);
        if (res) {
          this.getAudienceAreaV2('territory', res);
        }
      });
    }

  filteringProdukSearch() {
    if (!this.listFilterProducts) {
      return;
    }
      // get the search keyword
      let search = this.filterProdukSearch.value;
      if (!search) {
        this.filterProducts = this.listFilterProducts.slice();
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the products
      this.filterProducts = this.listFilterProducts.filter(item => item.name.toLowerCase().indexOf(search) > -1).map((v) => ({...v}));
  }

    getDetails() {
      this.dataService.showLoading(true);
      this.panelMitraService.detail({ panelMitraId: this.panelMitraId }).subscribe(
        res => {
          if (res.status === 'success') {
            this.panelMitraDetail = res.data;
            this.selected = res.data.wholesaler_id.map((id: any) => {
              return ({ id: id, isHub: res.data.is_hub ? res.data.is_hub.includes(id) : false });
            });
            this.getFilterSupplier({ id: res.data.product_id });
            this.formInput.get('filterproduct').setValue(res.data.product_id);
            this.formInput.get('filtersupplier').setValue(res.data.supplier_company_id);
            this.wholesalerIds = res.data.wholesaler_id;
            this.getListMitra();
          } else {
            this.panelMitraDetail = null;
            this.dialogService.openSnackBar({
              message: res.status
            });
            this.dataService.showLoading(false);
          }
        },
        err => {
          console.error(err);
          this.dataService.showLoading(false);
        }
      );
    }

    getFilterProduct(value?: any) {
      console.log('kk', this.formInput.get('filtercategory').value);
      this.panelMitraService.getFilterProduct({ param: value || '', categoryId: this.formInput.get('filtercategory').value, isAll: true }).subscribe(res => {
        if (res.status === 'success') {
          this.listFilterProducts =  [ { name: 'Pilih Produk', id: '' }, ...res.data ];
          this.filterProducts = this.listFilterProducts.map((v) => ({...v}));
        } else {
          this.listFilterProducts = [ { name: 'Pilih Produk', id: '' }, ];
          this.filterProducts = this.listFilterProducts;
        }
      });
    }

    getFilterSupplier(value?: any) {
      this.panelMitraService.getFilterSupplier( { productId: value.id }).subscribe(res => {
        if (res.status === 'success') {
          this.listFilterSupplier =  [ { name: 'Pilih Supplier', id: '' }, ...res.data ];
          this.filterSupplier = this.listFilterSupplier.map((v) => ({...v}));
        } else {
          this.listFilterSupplier = [ { name: 'Pilih Supplier', id: '' }, ];
          this.filterSupplier = this.listFilterSupplier;
        }
      });
    }

    selectionChangeFilterCategory(event: any) {
      const e = event.value;
      this.getFilterProduct();
    }

    selectionChangeFilterProduct(event: any) {
      const e = event.value;
      this.getFilterSupplier({ id: e });
    }

    selectionChangeFilterSupplier(event: any) {
      const e = event.value;
    }

    getListMitra_() {
      this.panelMitraService.getListMitra().subscribe(res => {
        if (res.status === 'success') {
          Page.renderPagination(this.pagination, res.data);
          this.rows = res.data.data;
          this.loadingIndicator = false;
        } else {
          this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.loadingIndicator = false;
        }
      }, err => {
        console.warn(err);
        this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
        this.loadingIndicator = false;
      });
    }

    onSelect({ selected }) {
      // console.log(arguments);
      this.selected.splice(0, this.selected.length);
      this.selected.push(...selected);
      // console.log('selected', selected);
      // console.log('this.selected', this.selected);
    }

    onSelectedHub(event: any, row: any) {
      if (event) {
        const temp = [...this.selected];
        const selectedItem = {...this.selected.filter((s: any) => s.id === row.id)[0]};
        const indexFind = this.selected.findIndex((i: any) => i.id === row.id);
        selectedItem['isHub'] = event.checked;
        if (indexFind !== -1) {
          temp[indexFind] = selectedItem;
          this.selected = temp;
        }
      }
    }

    onCheckboxChange(event: any, row: any) {
      if (event) {
        const temp = [...this.selected];
        const selectedItem = {...this.selected.filter((s: any) => s.id === row.id)[0]};
        const indexFind = this.selected.findIndex((i: any) => i.id === row.id);
        selectedItem['isHub'] = event.checked;
        if (indexFind !== -1) {
          temp[indexFind] = selectedItem;
          this.selected = temp;
        }
      }
    }

    checkHub(row: any) {
      try {
        if (this.selected && row) {
          if (this.allRowsSelected) {
            return this.allHubSelected;
          }
          return this.selected.filter((s: any) => s.isHub === true).map((m: any) => (m.id)).includes(row.id) || false;
        }
      } catch (x) {
        console.log('x', x);
      }
    }

    onAllSelectedHub(isBool: boolean) {
      this.allHubSelected = isBool;
    }

    selectFn(allRowsSelected: boolean) {
      // console.log('allRowsSelected_', allRowsSelected);
      this.allRowsSelected = allRowsSelected;
      this.allHubSelected = allRowsSelected;
      if (!allRowsSelected) { this.selected = []; }
      // else { this.selected.length = this.pagination.total; }
    }

    setPage(pageInfo) {
      this.offsetPagination = pageInfo.offset;
      this.loadingIndicator = true;
      if (this.pagination['search']) {
        this.pagination.page = pageInfo.offset + 1;
      } else {
        this.dataService.setToStorage('page', pageInfo.offset + 1);
        this.pagination.page = this.dataService.getFromStorage('page');
      }
      delete this.pagination['sort'];
      delete this.pagination['sort_type'];
      this.getListMitra();
      // this.panelMitraService.getListMitra(this.pagination, { wholesaler_id: this.wholesalerIds }).subscribe(res => {
      //   Page.renderPagination(this.pagination, res.data);
      //   this.rows = res.data.data;
      //   this.loadingIndicator = false;
      //   // this.allRowsSelected = false;
      //   // this.allRowsSelectedValid = false;
      // });
    }

    onSort(event) {
      this.pagination.sort = event.column.prop;
      this.pagination.sort_type = event.newValue;
      this.pagination.page = 1;
      this.loadingIndicator = true;

      this.dataService.setToStorage('page', this.pagination.page);
      this.dataService.setToStorage('sort', event.column.prop);
      this.dataService.setToStorage('sort_type', event.newValue);

      // this.panelMitraService.getListMitra(this.pagination).subscribe(res => {
      //   Page.renderPagination(this.pagination, res.data);
      //   this.rows = res.data.data;
      //   this.loadingIndicator = false;
      // });
      this.isSort = true;
      this.getListMitra();
    }

    getId(row) {
      return row.id;
    }

    onSave() {
      if (this.formInput.valid && this.selected.length > 0) {
        try {
          this.dataService.showLoading(true);
          let body = null;
          if (this.allRowsSelected) {
            body = {
              product_id: this.formInput.get('filterproduct').value,
              supplier_company_id: this.formInput.get('filtersupplier').value,
              type: 'all'
            };
          } else {
            body = {
              product_id: this.formInput.get('filterproduct').value,
              supplier_company_id: this.formInput.get('filtersupplier').value,
              wholesaler_id: this.selected.map((item) => item.id),
              is_hub: this.selected.filter((item: any) => item.isHub === true).map((item: any) => item.id)
            };
          }
          this.panelMitraService.update(body, { panelMitraId: this.panelMitraId }).subscribe(res => {
            this.dialogService.openSnackBar({
              message: 'Berhasil Menyimpan Data'
            });
            this.router.navigate(['user-management', 'supplier-panel-mitra']);
            this.dataService.showLoading(false);
            }, err => {
              console.log('err', err);
              this.dialogService.openSnackBar({
                message: err.error.message
              });
              this.dataService.showLoading(false);
            }
          );
        } catch (ex) {
          console.warn('ex onSave', ex);
        }
      } else {
        commonFormValidator.validateAllFields(this.formInput);
        if (this.selected.length === 0) {
          this.dialogService.openSnackBar({
            message: 'Belum ada data yg terpilih'
          });
        } else {
          try {
            this.myScrollContainer.nativeElement.scrollTop = 0;
          } catch (err) {
            console.log('Scrolling Error', err);
          }
        }
      }
    }

    initArea() {
      console.log('areaform login', this.areaFromLogin);
      this.areaFromLogin.map(item => {
        let level_desc = '';
        switch (item.type.trim()) {
          case 'national':
            level_desc = 'zone';
            this.formFilter.get('national').setValue(item.id);
            this.formFilter.get('national').disable();
            break;
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
          this.panelMitraService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
            this.panelMitraService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = [];
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
            this.panelMitraService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = [];
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
            this.panelMitraService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = [];
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
            this.panelMitraService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = [];
          }

          this.formFilter.get('district').setValue('');
          this.formFilter.get('territory').setValue('');
          this.list['territory'] = [];
          break;
        case 'territory':
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.panelMitraService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = [];
          }

          this.formFilter.get('territory').setValue('');
          break;

        default:
          break;
      }
    }


    getAudienceAreaV2(selection, id, event?) {
      let item: any;
      const fd = new FormData();
      const lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
      let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(lastLevel));
      // console.log('areaSelected', areaSelected, selection, lastLevel, Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })));
      console.log('audienceareav2', this.formFilter.getRawValue(), areaSelected[0]);
      if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
        fd.append('area_id[]', areaSelected[0].value);
      } else if (areaSelected.length > 0) {
        if (areaSelected[0].value !== '') {
          areaSelected[0].value.map(ar => {
            fd.append('area_id[]', ar);
          });
          // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
          if (areaSelected[0].value.length === 0) {
            const beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
            const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
            console.log('the selection', this.parseArea(selection), newAreaSelected);
            if (newAreaSelected[0].key !== 'national') {
              newAreaSelected[0].value.map(ar => {
                fd.append('area_id[]', ar);
              });
            } else {
              fd.append('area_id[]', newAreaSelected[0].value);
            }
          }
        }
      } else {
        const beforeLastLevel = this.geotreeService.getBeforeLevel(lastLevel);
        areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLastLevel));
        // console.log('new', beforeLastLevel, areaSelected);
        if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
          fd.append('area_id[]', areaSelected[0].value);
        } else if (areaSelected.length > 0) {
          if (areaSelected[0].value !== '') {
            areaSelected[0].value.map(ar => {
              fd.append('area_id[]', ar);
            });
            // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
            if (areaSelected[0].value.length === 0) {
              const beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
              const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
              console.log('the selection', this.parseArea(selection), newAreaSelected);
              if (newAreaSelected[0].key !== 'national') {
                newAreaSelected[0].value.map(ar => {
                  fd.append('area_id[]', ar);
                });
              } else {
                fd.append('area_id[]', newAreaSelected[0].value);
              }
            }
          }
        }
      }

      fd.append('area_type', selection === 'territory' ? 'teritory' : selection);
      let thisAreaOnSet = [];
      let areaNumber = 0;
      let expectedArea = [];
      if (!this.formFilter.get(this.parseArea(selection)).disabled) {
        thisAreaOnSet = this.areaFromLogin[0] ? this.areaFromLogin[0] : [];
        if (this.areaFromLogin[1]) { thisAreaOnSet = [
          ...thisAreaOnSet,
          ...this.areaFromLogin[1]
        ];
        }

        thisAreaOnSet = thisAreaOnSet.filter(ar => (ar.level_desc === 'teritory' ? 'territory' : ar.level_desc) === selection);
        if (id && id.length > 1) {
          areaNumber = 1;
        }

        if (areaSelected && areaSelected[0] && areaSelected[0].key !== 'national') { expectedArea = thisAreaOnSet.filter(ar => areaSelected[0].value.includes(ar.parent_id)); }
        // console.log('on set', thisAreaOnSet, selection, id);
      }


      switch (this.parseArea(selection)) {
        case 'zone':
          // area = this.formFilter.get(selection).value;
          this.geotreeService.getChildFilterArea(fd).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
            // this.list[this.parseArea(selection)] = res.data;
            this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

            // fd = null
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
          console.log('zone selected', selection, this.list['region'], this.formFilter.get('region').value);
          break;
        case 'region':
          // area = this.formFilter.get(selection).value;
          if (id && id.length !== 0) {
            item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => {
              return id && id.length > 0 ? id[0] : id;
            })[0] : {};
            if (item && item.name && item.name !== 'all') {
              this.geotreeService.getChildFilterArea(fd).subscribe(res => {
                // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
                // this.list[selection] = res.data;
                this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
                // fd = null
              });
            } else {
              this.list[selection] = [];
            }
          } else {
            this.list['region'] = [];
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
          // area = this.formFilter.get(selection).value;
          if (id && id.length !== 0) {
            item = this.list['region'].length > 0 ? this.list['region'].filter(item => {
              return id && id.length > 0 ? id[0] : id;
            })[0] : {};
            console.log('area hitted', selection, item, this.list['region']);
            if (item && item.name && item.name !== 'all') {
              this.geotreeService.getChildFilterArea(fd).subscribe(res => {
                // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
                // this.list[selection] = res.data;
                this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
                // fd = null
              });
            } else {
              this.list[selection] = [];
            }
          } else {
            this.list['area'] = [];
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
          // area = this.formFilter.get(selection).value;
          if (id && id.length !== 0) {
            item = this.list['area'].length > 0 ? this.list['area'].filter(item => {
              return id && id.length > 0 ? id[0] : id;
            })[0] : {};
            console.log('item', item);
            if (item && item.name && item.name !== 'all') {
              this.geotreeService.getChildFilterArea(fd).subscribe(res => {
                // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
                // this.list[selection] = res.data;
                this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
                // fd = null
              });
            } else {
              this.list[selection] = [];
            }
          } else {
            this.list['salespoint'] = [];
          }

          this.formFilter.get('salespoint').setValue('');
          this.formFilter.get('district').setValue('');
          this.formFilter.get('territory').setValue('');
          this.list['district'] = [];
          this.list['territory'] = [];
          break;
        case 'district':
          // area = this.formFilter.get(selection).value;
          if (id && id.length !== 0) {
            item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => {
              return id && id.length > 0 ? id[0] : id;
            })[0] : {};
            if (item && item.name && item.name !== 'all') {
              this.geotreeService.getChildFilterArea(fd).subscribe(res => {
                // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
                this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
                // fd = null
              });
            } else {
              this.list[selection] = [];
            }
          } else {
            this.list['district'] = [];
          }

          this.formFilter.get('district').setValue('');
          this.formFilter.get('territory').setValue('');
          this.list['territory'] = [];
          break;
        case 'territory':
          // area = this.formFilter.get(selection).value;
          if (id && id.length !== 0) {
            item = this.list['district'].length > 0 ? this.list['district'].filter(item => {
              return id && id.length > 0 ? id[0] : id;
            })[0] : {};
            if (item && item.name && item.name !== 'all') {
              this.geotreeService.getChildFilterArea(fd).subscribe(res => {
                // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
                // this.list[selection] = res.data;
                this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

                // fd = null
              });
            } else {
              this.list[selection] = [];
            }
          } else {
            this.list['territory'] = [];
          }

          this.formFilter.get('territory').setValue('');
          break;

        default:
          break;
      }
    }

    parseArea(type) {
      // return type === 'division' ? 'zone' : type;
      switch (type) {
        case 'division':
          return 'zone';
        case 'teritory':
        case 'territory':
          return 'territory';
        default:
          return type;
      }
    }

  getListMitra(string?: any, hubFilter?: any) {
    try {
      this.dataService.showLoading(true);
      this.pagination.per_page = 25;
      if (string) { this.pagination.search = string; } else { delete this.pagination.search; }
      const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
      const area_id = areaSelected[areaSelected.length - 1].value;
      const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
      this.pagination.area = area_id;

      // console.log('area_selected on ff list', areaSelected, this.list);
      if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
        this.pagination['after_level'] = true;
      } else {
        const lastSelectedArea: any = areaSelected[areaSelected.length - 1];
        const indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
        const indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
        let is_area_2 = false;

        let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
        let last_self_area = [];
        if (self_area.length > 0) {
          last_self_area.push(self_area[self_area.length - 1]);
        }

        if (this.areaFromLogin[1]) {
          const second_areas = this.areaFromLogin[1];
          last_self_area = [
            ...last_self_area,
            second_areas[second_areas.length - 1].id
          ];
          self_area = [
            ...self_area,
            ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
          ];
        }

        const newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

        if (this.pagination['after_level']) { delete this.pagination['after_level']; }
        this.pagination['self_area'] = self_area;
        this.pagination['last_self_area'] = last_self_area;
        let levelCovered = [];
        if (this.areaFromLogin[0]) { levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type)); }
        if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
          const oneAreaSelected = lastSelectedArea.value[0];
          const findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
          console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
          if (findOnFirstArea) { is_area_2 = false; } else { is_area_2 = true; }

          console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
          if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
            // console.log('its hitted [levelCovered > -1]');
            if (is_area_2) { this.pagination['last_self_area'] = [last_self_area[1]]; } else { this.pagination['last_self_area'] = [last_self_area[0]]; }
          } else {
            // console.log('its hitted [other level]');
            this.pagination['after_level'] = true;
            this.pagination['last_self_area'] = newLastSelfArea;
          }
        } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
          // console.log('its hitted [other level other]');
          this.pagination['after_level'] = true;
          if (newLastSelfArea.length > 0) {
            this.pagination['last_self_area'] = newLastSelfArea;
          }
        }
      }
      this.loadingIndicator = true;
      // this.pagination.area = this.formAudience.get('type').value === 'pick-all' ? 1 : area_id;

      // this.audienceService.getListRetailer(this.pagination).subscribe(res => {
      //   Page.renderPagination(this.pagination, res);
      //   this.rows = res.data;
      //   this.loadingIndicator = false;
      //   this.dataService.showLoading(false);
      // }, err => {
      //   this.dataService.showLoading(false);
      // })
      if (this.wholesalerIds.length > 0 && !this.isSort) {
        delete this.pagination['sort'];
        delete this.pagination['sort_type'];
      }

      let hub = null;
      if (hubFilter === '1') {
        hub = this.selected.filter((v) => v.isHub).map((v) => v.id);
      } else if (hubFilter === '0') {
        hub = this.selected.filter((v) => !v.isHub).map((v) => v.id);
      }

      this.panelMitraService.getListMitra(this.pagination, { wholesaler_id: this.wholesalerIds, only: hub }).subscribe(res => {
        if (res.status === 'success') {
          Page.renderPagination(this.pagination, res.data);
          this.totalData = res.data.total;
          this.rows = res.data.data;
          this.loadingIndicator = false;
          this.isSort = false;
          this.pagination.sort = 'name';
          this.pagination.sort_type = 'asc';
          this.dataService.showLoading(false);
        } else {
          this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
        }
      }, err => {
        console.warn(err);
        this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      });
      } catch (ex) {
        console.log('ex', ex);
      }
    }

    checkAreaLocation(area, lastSelfArea) {
      const lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
      const areaAfterEndLevel = this.geotreeService.getNextLevel(lastLevelFromLogin);
      const indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
      const indexAreaSelected = areaList.indexOf(area.key);
      const rawValues = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value }));
      let newLastSelfArea = [];
      // console.log('[checkAreaLocation:area]', area);
      // console.log('[checkAreaLocation:lastLevelFromLogin]', lastLevelFromLogin);
      // console.log('[checkAreaLocation:areaAfterEndLevel]', areaAfterEndLevel);
      if (area.value !== 1) {
        // console.log('[checkAreaLocation:list]', this.list[area.key]);
        // console.log('[checkAreaLocation:indexAreaAfterEndLevel]', indexAreaAfterEndLevel);
        // console.log('[checkAreaLocation:indexAreaSelected]', indexAreaSelected);
        if (indexAreaSelected >= indexAreaAfterEndLevel) {
          // let sameAreas = this.list[area.key].filter(ar => area.value.includes(ar.id));
          const areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
          newLastSelfArea = this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id).filter((v, i, a) => a.indexOf(v) === i);
          // console.log('[checkAreaLocation:list:areaAfterEndLevel', this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)), areaSelectedOnRawValues);
          // console.log('[checkAreaLocation:newLastSelfArea]', newLastSelfArea);
        }
      }

      return newLastSelfArea;
    }

    filteringGeotree(areaList) {
      return areaList;
    }


    initAreaV2() {
      const areas = this.dataService.getDecryptedProfile()['areas'] || this.defaultAreas;
      this.geotreeService.getFilter2Geotree(areas);
      const sameArea = this.geotreeService.diffLevelStarted;
      const areasDisabled = this.geotreeService.disableArea(sameArea);
      this.lastLevel = areasDisabled;
      let lastLevelDisabled = null;
      const levelAreas = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
      const lastDiffLevelIndex = levelAreas.findIndex(level => level === (sameArea.type === 'teritory' ? 'territory' : sameArea.type));

      if (!this.formFilter.get('national') || this.formFilter.get('national').value === '') {
        this.formFilter.get('national').setValue(1);
        this.formFilter.get('national').disable();
        lastLevelDisabled = 'national';
      }
      areas.map((area, index) => {
        area.map((level, i) => {
          const level_desc = level.level_desc;
          const levelIndex = levelAreas.findIndex(lvl => lvl === level.type);
          if (lastDiffLevelIndex > levelIndex - 2) {
            if (!this.list[level.type]) { this.list[level.type] = []; }
            if (!this.formFilter.controls[this.parseArea(level.type)] || !this.formFilter.controls[this.parseArea(level.type)].value || this.formFilter.controls[this.parseArea(level.type)].value === '') {
              this.formFilter.controls[this.parseArea(level.type)].setValue([level.id]);
              console.log('ff value', this.formFilter.value);
              // console.log(this.formFilter.controls[this.parseArea(level.type)]);
              if (sameArea.level_desc === level.type) {
                lastLevelDisabled = level.type;

                this.formFilter.get(this.parseArea(level.type)).disable();
              }

              if (areasDisabled.indexOf(level.type) > -1) { this.formFilter.get(this.parseArea(level.type)).disable(); }
              // if (this.formFilter.get(this.parseArea(level.type)).disabled) this.getFilterArea(level_desc, level.id);
              console.log(this.parseArea(level.type), this.list[this.parseArea(level.type)]);
            }

            const isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
            level['area_type'] = `area_${index + 1}`;
            this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
              ...this.list[this.parseArea(level.type)],
              level
            ];
            console.log('area you choose', level.type, this.parseArea(level.type), this.geotreeService.getNextLevel(this.parseArea(level.type)));
            if (!this.formFilter.controls[this.parseArea(level.type)].disabled) { this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id); }

            if (i === area.length - 1) {
              this.endArea = this.parseArea(level.type);
              this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
            }
          }
        });
      });

      // let mutableAreas = this.geotreeService.listMutableArea(lastLevelDisabled);
      // mutableAreas.areas.map((ar, i) => {
      //   this.list[ar].splice(1, 1);
      // });
    }


  importMitra(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = {};

    this.dialogRef = this.dialog.open(ImportPanelMitraDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        if (response.data) {
          this.selected = response.data.map((item: any) => ({ id: item.id, isHub: item.is_hub ? true : false }));
          console.log('response.data', response.data);
          console.log('this.selected', this.selected);
          this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
        }
      }
    });
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }
    return '';
  }

  async exportMitra() {
    this.dataService.showLoading(true);
    const fileName = `Private_Label_Panel_Mitra_${moment(new Date()).format('YYYY_MM_DD')}.xls`;
    const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    const area = areaSelected[areaSelected.length - 1].value;
    if (!this.allRowsSelected) {
    if (this.selected.length > 0) {
      const body = {
        wholesaler_id: this.selected.map((item) => item.id),
        is_hub: this.selected.filter((item: any) => item.isHub === true).map((item: any) => item.id),
        area: area
      };

      try {
        const response = await this.panelMitraService.exportMitra(body).toPromise();
        // console.log('he', response.headers);
        this.downLoadFile(response, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileName);
        this.dataService.showLoading(false);
      } catch (error) {
        this.handleError(error);
        this.dataService.showLoading(false);
      }
    } else {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: 'Mitra Belum dipilih!' });
    }
    } else {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: 'Tidak Dapat Export Semua Data, Silahkan Pilih beberapa data!' });
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    const link = document.createElement('a');
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
    console.log('Here');
    console.log(error);

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

  aturPanelMitra() {
    if (this.formInput.valid) {
      const body = {
        product_id: this.formInput.get('filterproduct').value,
        supplier_company_id: this.formInput.get('filtersupplier').value,
      };
      this.filterHub.setValue('');
      this.panelMitraService.checkPanelMitra(body).subscribe(res => {
          this.wholesalerIds = res.data.wholesaler_id;
          this.selected = res.data.wholesaler_id.map((id: any) => {
            return ({ id: id, isHub: res.data.is_hub ? res.data.is_hub.includes(id) : false });
          });
          this.getListMitra();
        }, err => {
          console.log('err', err);
          this.dialogService.openSnackBar({
            message: err.error.message
          });
        }
      );
    } else {
      commonFormValidator.validateAllFields(this.formInput);
      this.dialogService.openSnackBar({
        message: 'Product dan supplier harus dipilih'
      });
    }
  }

}

