import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DateAdapter, MatDialogConfig, MatDialog, MatSelect } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { ListAudienceDialogComponent } from '../../schedule-program/dialog/list-audience-dialog.component';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { ImportCoinComponent } from '../../schedule-program/import-coin/import-coin.component';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { TaskVerificationService } from 'app/services/dte/task-verification.service';
import { GeotreeService } from 'app/services/geotree.service';
import { Page } from 'app/classes/laravel-pagination';
import { ConfirmDialogTsmComponent } from '../dialog/confirm-dialog-tsm/confirm-dialog-tsm.component';

@Component({
  selector: 'app-task-verification-detail-tsm',
  templateUrl: './task-verification-detail-tsm.component.html',
  styleUrls: ['./task-verification-detail-tsm.component.scss']
})
export class TaskVerificationDetailTsmComponent implements OnInit {
  idTsm: any;
  idTemplate: any;
  dataTsm: any;
  dialogRef: any;

  listTradeProgram: Array<any>;
  listTemplateTask: Array<any>;
  onLoad: Boolean = true;
  showLoading: Boolean;

  formSchedule: FormGroup;
  formScheduleError: any;
  minDate: any;
  maxStartDateTemplate: any;
  maxDateTemplate: any;

  listAudience: Array<any>;

  listReminder: Array<any> = [{ name: 'Tiap Minggu', value: 'by-weekly' }, { name: 'Tiap 2 Minggu', value: 'bi-weekly' }, { name: 'Tidak Ada', value: 'none' }];
  listNotification: Array<any> = [{ name: 'Ya', value: 1 }, { name: 'Tidak', value: 0 }];
  listAddNotif: Array<any> = [{ name: 'H+1', value: 1 }, { name: 'H+2', value: 2 }, { name: 'H+3', value: 3 }];

  public filterTP: FormControl = new FormControl();
  public filteredTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterTask: FormControl = new FormControl();
  public filteredTask: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  valueChange: Boolean;
  saveData: Boolean;

  permissionVerifikasiMisi: any;
  permissionReleaseCoin: any;
  roles: PagesName = new PagesName();
  statusValue: any = [];
  statusCoinSelected: any = [];
  irCheckSelected: any = [];

  formFilter: FormGroup;
  lastLevel: any;
  endArea: String;
  area_id_list: any = [];
  listLevelArea: any[];
  list: any;
  areaFromLogin: any;
  audience_group_id: any;

  loadingIndicator: boolean;
  rows: any[];
  pagination: Page = new Page();
  status: Array<object> = [
    { label: 'Draft', value: 'draft' },
    { label: 'Submitted', value: 'pending' },
    { label: 'Not Submitted', value: ['active', 'not-active'] },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
  ];

  statusCoinList: Array<object> = [
    { label: 'Sudah Dikirim', value: 'sudah_dikirim' },
    { label: 'Belum Dikirim', value: 'belum_dikirim' },
  ];

  irCheckList: Array<object> = [
    { label: 'Checked By IR', value: 'checked_by_ir' },
    { label: 'Checking', value: 'checking' },
    { label: 'Not Submitted', value: 'not_submitted' },
  ];

  keyUp = new Subject<string>();
  formSearch: FormControl = new FormControl('');

  constructor(
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private taskVerificationService: TaskVerificationService,
    private dataService: DataService,
    private geotreeService: GeotreeService,
  ) {
    this.permissionVerifikasiMisi = this.roles.getRoles('principal.dtetaskverification');
    this.permissionReleaseCoin = this.roles.getRoles('principal.dtetaskverificationreleasecoin');
    console.log(this.permissionVerifikasiMisi, this.permissionReleaseCoin);

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
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
    this.rows = [];
    this.loadingIndicator = false;

    activatedRoute.url.subscribe(param => {
      this.idTsm = param[2].path;
      this.idTemplate = param[3].path;
    });

    this.saveData = false;
    this.adapter.setLocale('id');
    this.listTemplateTask = this.activatedRoute.snapshot.data['listTemplate'].data;
    this.listTradeProgram = this.activatedRoute.snapshot.data['listTradeProgram'].data;
    this.audience_group_id = null;

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.formSearch.setValue(data);
        this.loadFormFilter(data);
      });
  }

  ngOnInit() {

    this.formFilter = this.formBuilder.group({
      national: [''],
      zone: [''],
      region: [''],
      area: [''],
      salespoint: [''],
      district: [''],
      territory: [''],
      status: [''],
    });

    this.formSchedule = this.formBuilder.group({
      name: ['', Validators.required],
      trade_creator_id: ['', Validators.required],
      task_templates: this.formBuilder.array([this.createTaskTemplate()], Validators.required),
    });

    this.formSchedule.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formSchedule, this.formScheduleError);
    });

    this.formSchedule.valueChanges.subscribe(res => {
      this.valueChange = true;
    });
    this.getDetail();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      // this.getListAudience(this.audience_group_id);
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
    // this.formFilter.get('status').valueChanges.subscribe(res => {
    //   console.log('status', res);
    //   if (res) {
    //     this.klik(res);
    //   }
    // });
  }

  getDetail() {
    this.taskVerificationService.getDetailTsm({ id: this.idTsm, template_id: this.idTemplate }).subscribe(res => {
      this.dataTsm = res.data;
      this.onLoad = false;
      this.initAreaV2();
      this.audience_group_id = res.data.audience_group_id;
      this.getListAudience(res.data.audience_group_id);
    });
  }

  loadFormFilter(search?: string) {
    if (!search && this.formSearch.value) search = this.formSearch.value;

    this.getListAudience(this.audience_group_id, search)
  }

  createTaskTemplate(): FormGroup {
    return this.formBuilder.group({
      task_template_id: ['', Validators.required],
      coin_delivered: ['', [Validators.required, Validators.min(0)]],
      coin_approved: ['', [Validators.required, Validators.min(0)]],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      repeated: ['by-weekly', Validators.required],
      is_backup: [1, Validators.required],
      is_verification_toggle: [false, Validators.required],
      notif: [1, Validators.required]
    });
  }

  openListAudience(item) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = item;

    this.dialogRef = this.dialog.open(ListAudienceDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => { });
  }

  export() {

    const body = {
      trade_scheduler_id: this.dataTsm.id,
      trade_creator_id: this.dataTsm.trade_creator_id
    };

    this.dataService.showLoading(true);
    this.taskVerificationService.downloadExcel(body).subscribe(res => {
      // window.open(res.data, "_blank");
      // const link = document.createElement('a');
      // link.target = '_blank';
      // link.href = res.data;
      // link.setAttribute('visibility', 'hidden');
      // link.click();

      this.downloadLink.nativeElement.href = res.data;
      this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);
      // console.log(res);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  import() {

    if (this.dataTsm.status_berjalan === 'expired') {
      return this.dialogService.openSnackBar({
        message: `Tidak dapat adjust coin karna status scheduler trade program telah ${this.dataTsm.status_berjalan}`
      });
    }

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'adjustment-coin-dialog';
    dialogConfig.data = this.dataTsm;

    this.dialogRef = this.dialog.open(ImportCoinComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.dialogService.openSnackBar({ message: 'Data berhasil disimpan' });
      }
    });
  }

  // NEW FEATURE

  getListAudience(id: any, search?: string) {
    this.dataService.showLoading(true);
    this.pagination.page = 1;
    // this.pagination.per_page = 25;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    if (this.statusValue.length !== 0) {
      this.pagination.status = this.statusValue;
    }
    if (this.statusCoinSelected.length !== 0) {
      this.pagination['status_coin'] = this.statusCoinSelected;
    }
    if (this.irCheckSelected.length !== 0) {
      this.pagination['ir_check'] = this.irCheckSelected;
    }
    const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
      ({ key, value })).filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    const area_id = areaSelected[areaSelected.length - 1].value;
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    this.pagination.area = area_id;

    console.log('area_selected on ff list', areaSelected, this.list);
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
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) {
            this.pagination['last_self_area'] = [last_self_area[1]];
          } else { this.pagination['last_self_area'] = [last_self_area[0]]; }
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
    this.pagination['search'] = search;
    this.loadingIndicator = true;
    // this.pagination.area = this.formAudience.get('type').value === 'pick-all' ? 1 : area_id;

    this.taskVerificationService.getListAudienceTsm({ audience_id: id, template_id: this.idTemplate }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
      this.pagination.status = null;
      delete this.pagination['status_coin'];
      delete this.pagination['ir_check'];
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }


  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.taskVerificationService.getListAudienceTsm({ audience_id: this.audience_group_id, template_id: this.idTemplate }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event['newValue'];
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.taskVerificationService.getListAudienceTsm({ audience_id: this.audience_group_id, template_id: this.idTemplate }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  initAreaV2() {
    const areas = this.dataService.getDecryptedProfile()['areas'] || [];
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
          if (!this.formFilter.controls[this.parseArea(level.type)] ||
            !this.formFilter.controls[this.parseArea(level.type)].value ||
            this.formFilter.controls[this.parseArea(level.type)].value === '') {
            this.formFilter.controls[this.parseArea(level.type)].setValue([level.id]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) { this.formFilter.get(this.parseArea(level.type)).disable(); }
          }

          const isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
          level['area_type'] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
            ...this.list[this.parseArea(level.type)],
            level
          ];
          if (!this.formFilter.controls[this.parseArea(level.type)].disabled) {
            this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
          }

          if (i === area.length - 1) {
            this.endArea = this.parseArea(level.type);
            this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
          }
        }
      });
    });
  }

  parseArea(type) {
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
      if (this.areaFromLogin[1]) {
        thisAreaOnSet = [
          ...thisAreaOnSet,
          ...this.areaFromLogin[1]
        ];
      }

      thisAreaOnSet = thisAreaOnSet.filter(ar => (ar.level_desc === 'teritory' ? 'territory' : ar.level_desc) === selection);
      if (id && id.length > 1) {
        areaNumber = 1;
      }

      if (areaSelected && areaSelected[0] && areaSelected[0].key !== 'national') {
        expectedArea = thisAreaOnSet.filter(ar => areaSelected[0].value.includes(ar.parent_id));
      }
      // console.log('on set', thisAreaOnSet, selection, id);
    }


    switch (this.parseArea(selection)) {
      case 'zone':
        // area = this.formFilter.get(selection).value;
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          // this.list[this.parseArea(selection)] = res.data;
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ?
            res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

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
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

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

  filteringGeotree(areaList) {
    return areaList;
  }

  checkAreaLocation(area, lastSelfArea) {
    const lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    const areaAfterEndLevel = this.geotreeService.getNextLevel(lastLevelFromLogin);
    const indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    const indexAreaSelected = areaList.indexOf(area.key);
    const rawValues = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = [];
    if (area.value !== 1) {
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        const areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
        newLastSelfArea = this.list[areaAfterEndLevel].filter(ar =>
          areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id
          ).filter((v, i, a) => a.indexOf(v) === i);
      }
    }
    return newLastSelfArea;
  }

  openConfirmDialog(item: any, popupType: string) {
    const dialogConfig = new MatDialogConfig();
    const data = this.dataTsm;
    data.retailer_id = item.id;
    data.popupType = popupType;
    data.name = item.name;
    data.code = item.code;
    data.status_coin = item.status_coin;
    dialogConfig.data = data;
    if (popupType === 'Verifikasi Misi') {
      dialogConfig.disableClose = false;
    } else {
      dialogConfig.disableClose = true;
    }

    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';

    this.dialogRef = this.dialog.open(ConfirmDialogTsmComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.getDetail();
      }
    });
  }

}
