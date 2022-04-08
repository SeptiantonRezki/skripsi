import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  OnChanges,
} from "@angular/core";
import { formatCurrency } from "@angular/common";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from '../../../services/data.service';
import { AudienceService } from "../../../services/dte/audience.service";
import { DialogService } from "../../../services/dialog.service";
import { Subject, Observable, ReplaySubject, Subscription } from "rxjs";
import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import { takeUntil } from "rxjs/operators";
import { RupiahFormaterPipe } from "@fuse/pipes/rupiah-formater";
import { commonFormValidator } from "../../../classes/commonFormValidator";
import { Page } from "../../../classes/laravel-pagination";
import * as _ from "underscore";
import { environment } from "environments/environment";
import { GeotreeService } from "app/services/geotree.service";
import { IdbService } from "app/services/idb.service";
import {NotesRetailerModel} from 'app/pages/notes-retailer/notes-retailer.model';
import { NotesRetailerService } from '../../../services/notes-retailer/notes-retailer.service';
import { ImportNotesDialogComponent } from '../import-component/import-notes-dialog.component';
import moment from 'moment';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: 'app-create-notes-retailer.component',
  templateUrl: './create-notes-retailer.component.html'
})
export class CreateNotesRetailerComponent implements OnInit {
  formAudience: FormGroup;
  formAudienceError: any;
  parameters: Array<string>;
  paramEdit: any = null;

  listScheduler: any[];
  listTradePrograms: any[];
  listRetailer: any;
  rows: any[];
  listType: any[] = [
    { name: "Batasi Audience", value: "limit" },
    { name: "Pilih Semua", value: "pick-all" },
  ];
  tsmScheduler: any[] = [
    { name: "TSM", value: "tsm" },
    { name: "Scheduler", value: "scheduler" },
  ];
  listAudienceType: any[] = [{ name: 'Misi', value: 'mission' }, { name: 'Tantangan', value: 'challenge' }];

  retailClassification: any[] = [
    { name: "Semua Tipe", value: "all" },
    { name: "SRC", value: "SRC" },
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "GT", value: "GT" },
    { name: "KA", value: "KA" }
  ];
  srcClassification: any[] = [
    { name: "Semua Tipe", value: "all" }
  ];
  srcType: any[] = [
    { name: "Semua Tipe", value: "all" }
  ];

  selected = [];
  area: Array<any>;
  queries: any;
  data = [];
  pagination: Page = new Page();

  searchRetailer = new Subject<string>();

  valueChange: Boolean;
  dialogRef: any;

  listLevelArea: any[];
  private subscription: Subscription;
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  formFilterRetailer: FormGroup;
  notesMdl: NotesRetailerModel;

  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  allRowsSelected: boolean;
  status:  Boolean = true;
  isSelectedAll: boolean = false;

  public filterScheduler: FormControl = new FormControl();
  public filteredScheduler: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterTradeProgram: FormControl = new FormControl();
  public filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(
    1
  );

  @ViewChild("downloadLink") downloadLink: ElementRef;
  @ViewChild("singleSelect") singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  areaIds: any;
  rawAreaIds: any;
  selectedIds: any = {};

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.exportTemplate) {
      return true;
    }

    if (
      (this.valueChange && !this.saveData) ||
      (this.selected.length > 0 && !this.saveData)
    )
      return false;

    // if (this.selected.length > 0)
    //   return false;

    return true;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private rupiahFormater: RupiahFormaterPipe,
    private dialog: MatDialog,
    private geotreeService: GeotreeService,
    private idbService: IdbService,
    private route: ActivatedRoute,
    private notesRetailerService: NotesRetailerService,
    private ls: LanguagesService,
  ) {
    this.notesMdl = new NotesRetailerModel();
    this.exportTemplate = false;
    this.saveData = false;
    this.rows = [];
    this.formAudienceError = {
      name: {},
      min: {},
      max: {},
      trade_scheduler_id: {},
    };

    this.areaFromLogin = this.dataService.getDecryptedProfile()["areas"];
    this.area_id_list = this.dataService.getDecryptedProfile()["area_id"];
    this.listLevelArea = [
      {
        id: 1,
        parent_id: null,
        code: "SLSNTL      ",
        name: "SSLSNTL",
      },
    ];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: [],
    };

    this.searchRetailer
      .debounceTime(500)
      .flatMap((search) => {
        return Observable.of(search).delay(500);
      })
      .subscribe((res) => {
        this.searchingRetailer(res);
      });
    this.area = dataService.getDecryptedProfile()["area_type"];
    this.parameters = [];
  }

  ngOnInit() {
    this.idbService.reset();

    this.subscription = this.route.params.subscribe((params) => {
      if (params['id']) {
        this.paramEdit = params['id'];
        this.notesMdl =  this.dataService.getFromStorage('detail_notes');
        this.selected = this.notesMdl.audiences.map((item: any) => ({id: item }));
        this.status = this.notesMdl.status === "active";
      }
    });

    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      min: ["", [Validators.required, Validators.min(0)]],
      max: ["", [Validators.required, Validators.min(0)]],
      limit: ["limit"],
      type: ["mission", Validators.required],
      audience_type: ["tsm", Validators.required],
      business_checkbox: true,
      geotree_checkbox: true,
      trade_scheduler_id: [""],
      trade_creator_id: [""],
      target_audience: this.paramEdit ? this.notesMdl.target_audience : false,
    });

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""],
    });

    this.formFilterRetailer = this.formBuilder.group({
      retail_classification: [''],
      src_classification: [''],
      src_type: ['']
    });

    this.formAudience.controls["limit"].valueChanges.subscribe((res) => {
      if (res === "pick-all") {
        this.formAudience.get("min").disable({ emitEvent: false });
        this.formAudience.get("max").disable({ emitEvent: false });

        // this.getRetailer();
      } else {
        this.formAudience.get("min").enable({ emitEvent: false });
        this.formAudience.get("max").enable({ emitEvent: false });
      }
    });

    this.formAudience.controls["min"].valueChanges
      .debounceTime(500)
      .subscribe((res) => {
        if (this.formAudience.get("min").valid) {
          this.formAudience
            .get("max")
            .setValidators([Validators.required, Validators.min(res)]);
          this.formAudience.get("max").updateValueAndValidity();
        }
      });

    // this.getListScheduler();

    this.formAudience.get("audience_type").valueChanges.subscribe((data) => {
      if (data === 'scheduler' && this.formAudience.get("type").value === 'mission') {
        this.getListScheduler();
      }
    })
    this.formAudience.get("type").valueChanges.subscribe((data) => {
      // console.log("type", data);
      if (data === "mission") {
        if (this.formAudience.get("audience_type").value === 'scheduler') {
          this.getListScheduler();
          this.formAudience
            .get("trade_scheduler_id")
            .setValidators(Validators.required);
        }
        this.formAudience.get("trade_creator_id").setValidators([]);
        this.formAudience.get("trade_creator_id").clearValidators();
        this.formAudience.get("trade_creator_id").updateValueAndValidity();
      } else {
        this.getTradePrograms();
        this.formAudience
          .get("trade_creator_id")
          .setValidators(Validators.required);
        this.formAudience.get("trade_scheduler_id").setValidators([]);
        this.formAudience.get("trade_scheduler_id").clearValidators();
        this.formAudience.get("trade_scheduler_id").updateValueAndValidity();
      }
    });

    this.formAudience.valueChanges.subscribe(() => {
      this.valueChange = true;
    });

    this.formFilter.valueChanges.debounceTime(1000).subscribe((res) => {
    });

    this.filterScheduler.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringScheduler();
      });

    this.filterTradeProgram.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringTradeProgram();
      });

    this.formFilterRetailer.valueChanges.debounceTime(1000).subscribe((res) => {
      this.getRetailer();
    });

    this.formFilterRetailer.get('retail_classification').valueChanges.subscribe((res) => {
      if (res) {
        this.pagination['classification'] = res;
      } else {
        delete this.pagination['classification'];
      }
    });

    this.formAudience.get("target_audience").valueChanges.subscribe((value) => {
      if (value) this.getRetailer();
      else this.selected = [];
    });

    if (this.notesMdl.geotree) this.selectedIds = this.notesMdl.geotree;
  }

  onChangeInputSlide(event: any, i: number) {
    if (event.checked == true) {
      this.notesMdl.status = 'active';
    } else {
      this.notesMdl.status = 'inactive';
    }
  }

  klikCreate() {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    this.notesMdl.status = 'active';
    this.notesMdl.retailer_id = this.selected.map((map) => map.id);
    this.notesMdl.start_date = this.convertDate(this.notesMdl.start_date);
    this.notesMdl.end_date =  this.convertDate(this.notesMdl.end_date);
    this.notesMdl.target_audience = this.formAudience.get("target_audience")
    .value
    ? 1
    : 0;
    this.notesMdl.classification = this.formFilterRetailer.get(
      "retail_classification"
    ).value;
    this.notesMdl.src_classification =
      this.formFilterRetailer.get("src_classification").value;
    this.notesMdl.src_type = this.formFilterRetailer.get("src_type").value;
    this.notesMdl.area_id = this.lastLevel.id;
    this.notesRetailerService.create(this.notesMdl).subscribe((res) => {
      this.selected = [];
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      this.router.navigate(["notesretailer", "notes-retailer-list"]);
    });
  }

  klikUpdate() {
    this.loadingIndicator = true;
    this.dataService.showLoading(true);
    this.notesMdl.retailer_id = this.selected.map((map) => map.id);
    this.notesMdl.start_date = this.convertDate(this.notesMdl.start_date);
    this.notesMdl.end_date =  this.convertDate(this.notesMdl.end_date);
    this.notesMdl.target_audience = this.formAudience.get("target_audience")
      .value
      ? 1
      : 0;
    this.notesMdl.classification = this.formFilterRetailer.get(
      "retail_classification"
    ).value;
    this.notesMdl.src_classification =
      this.formFilterRetailer.get("src_classification").value;
    this.notesMdl.src_type = this.formFilterRetailer.get("src_type").value;
    this.notesMdl.area_id = this.lastLevel.id;
    this.notesRetailerService.put(this.notesMdl, this.paramEdit).subscribe((res) => {
      window.localStorage.removeItem('detail_audience');
      this.selected = [];
      this.router.navigate(["notesretailer", "notes-retailer-list"]);
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    });
  }

  loadFormFilter() {
    this.getRetailer();
  }

  clickMe(input, parameter) {
    if (parameter !== null) {
      this.parameters.push(parameter);
      input.value = "";
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

  deleteLanguage(paramter) {
    const index = this.parameters.indexOf(paramter);
    if (index >= 0) this.parameters.splice(index, 1);
  }

  parseArea(type) {
    switch (type) {
      case "division":
        return "zone";
      case "teritory":
      case "territory":
        return "territory";
      default:
        return type;
    }
  }

  filteringGeotree(areaList) {
    return areaList;
  }

  getTradePrograms() {
    this.audienceService.getListTradePrograms().subscribe(
      (res) => {
        // console.log("res trade programs", res);
        this.listTradePrograms = res.data;
        this.filteredTradeProgram.next(res.data);
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

  getListScheduler() {
    this.audienceService.getListScheduler().subscribe(
      (res) => {
        // console.log("res scheduler new", res);
        this.listScheduler = res.data;
        this.filteredScheduler.next(res.data);
      },
      (err) => {
        console.log("err list scheduler new", err);
      }
    );
  }

  checkAreaLocation(area, lastSelfArea) {
    let lastLevelFromLogin = this.parseArea(
      this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type
    );
    let areaList = [
      "national",
      "division",
      "region",
      "area",
      "salespoint",
      "district",
      "territory",
    ];
    let areaAfterEndLevel = this.geotreeService.getNextLevel(
      lastLevelFromLogin
    );
    let indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    let indexAreaSelected = areaList.indexOf(area.key);
    let rawValues = Object.entries(
      this.formFilter.getRawValue()
    ).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = [];
    if (area.value !== 1) {
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        let areaSelectedOnRawValues: any = rawValues.find(
          (raw) => raw.key === areaAfterEndLevel
        );
        newLastSelfArea = this.list[areaAfterEndLevel]
          .filter((ar) => areaSelectedOnRawValues.value.includes(ar.id))
          .map((ar) => ar.parent_id)
          .filter((v, i, a) => a.indexOf(v) === i);
      }
    }

    return newLastSelfArea;
  }

  getAreaIds(lastSelected: any) {
    const [id, key, onClick] = lastSelected;
    this.lastLevel = { id, key };
    if (onClick) this.selected = [];
    if (this.formAudience.get("target_audience").value) this.getRetailer();
  }

  getRawAreaIds(data: any) {
    this.rawAreaIds = data;
  }

  getRetailer() {
    this.pagination.per_page = 10;
    this.pagination.sort = "name";
    this.pagination.sort_type = "asc";
    let areaSelected = Object.entries(this.formFilter.getRawValue())
      .map(([key, value]) => ({ key, value }))
      .filter(
        (item: any) =>
          item.value !== null && item.value !== "" && item.value.length !== 0
      );
    let area_id = this.lastLevel.id;
    console.log("area_id", area_id);
    let areaList = [
      "national",
      "division",
      "region",
      "area",
      "salespoint",
      "district",
      "territory",
    ];
    this.pagination.area = area_id;

    if (
      this.areaFromLogin[0].length === 1 &&
      this.areaFromLogin[0][0].type === "national" &&
      this.pagination.area !== 1
    ) {
      this.pagination["after_level"] = true;
    } else {
      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      console.log("lastSelectedArea", lastSelectedArea)
      let indexAreaAfterEndLevel = areaList.indexOf(
        this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type
      );
      console.log("indexAreaAfterEndLevel", indexAreaAfterEndLevel);
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
      console.log("indexAreaSelected", indexAreaSelected);
      let is_area_2 = false;

      let self_area = this.areaFromLogin[0]
        ? this.areaFromLogin[0].map((area_1) => area_1.id)
        : [];
      let last_self_area = [];
      if (self_area.length > 0) {
        last_self_area.push(self_area[self_area.length - 1]);
      }

      if (this.areaFromLogin[1]) {
        let second_areas = this.areaFromLogin[1];
        last_self_area = [
          ...last_self_area,
          second_areas[second_areas.length - 1].id,
        ];
        self_area = [
          ...self_area,
          ...second_areas
            .map((area_2) => area_2.id)
            .filter((area_2) => self_area.indexOf(area_2) === -1),
        ];
      }

      let newLastSelfArea = this.checkAreaLocation(
        areaSelected[areaSelected.length - 1],
        last_self_area
      );

      console.log("newLastSelfArea", newLastSelfArea);

      if (this.pagination["after_level"]) delete this.pagination["after_level"];
      this.pagination["self_area"] = self_area;
      this.pagination["last_self_area"] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0])
        levelCovered = this.areaFromLogin[0].map((level) =>
          this.parseArea(level.type)
        );
      if (
        lastSelectedArea.value.length === 1 &&
        this.areaFromLogin.length > 1
      ) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(
          (are) => are.id === oneAreaSelected
        );
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          if (is_area_2)
            this.pagination["last_self_area"] = [last_self_area[1]];
          else this.pagination["last_self_area"] = [last_self_area[0]];
        } else {
          this.pagination["after_level"] = true;
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        this.pagination["after_level"] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      }
    }

    this.loadingIndicator = true;
    this.audienceService.getListRetailer(this.pagination).subscribe(
      (res) => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
        if (this.isSelectedAll) {
          this.onSelect({ selected: res.data });
        }
      },
      (err) => {
        this.loadingIndicator = false;
      }
    );
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.audienceService.getListRetailer(this.pagination).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      let rows = this.rows.map((row) => row.id);
      if (this.isSelectedAll) {
        this.onSelect({ selected: res.data });
      }

      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event["newValue"];
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.audienceService.getListRetailer(this.pagination).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      let rows = this.rows.map((row) => row.id);

      this.loadingIndicator = false;
    });
  }

  setAllSelected(state: boolean) {
    if (this.isSelectedAll !== state) {
      this.isSelectedAll = state;
    }
    return state;
  }

  onSelect({ selected }) {
    let items = [...selected];
    this.selected.splice(0, items.length);
    this.selected = items;
  }

  getRowId(row: any) {
    return row.id;
  }

  // selectFn(allRowsSelected: boolean) {
  //   // console.log('allRowsSelected_', allRowsSelected);
  //   this.allRowsSelected = allRowsSelected;
  //   if (allRowsSelected) {
  //     this.formAudience.get('limit').setValue('pick-all');
  //   } else {
  //     this.formAudience.get('limit').setValue('limit');
  //   }
  // }

  appendRows(rows, next) {
    (rows || []).map((item) => {
      this.data.push(item);
    });

    if (next) {
      let page = { page: next.split("?page=")[1] };

      this.audienceService.getListRetailer(page).subscribe((res) => {
        this.appendRows(res["data"], res["next_page_url"]);

        if (res["next_page_url"] === null) {
          this.loadingIndicator = false;
          this.rows = this.data;

          // return this.data = [];
        }
      });
    } else {
      this.loadingIndicator = false;
      this.rows = this.data;

      // return this.data = [];
    }
  }

  filteringScheduler() {
    if (!this.listScheduler) {
      return;
    }
    // get the search keyword
    let search = this.filterScheduler.value;
    if (!search) {
      this.filteredScheduler.next(this.listScheduler.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredScheduler.next(
      this.listScheduler.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  filteringTradeProgram() {
    if (!this.listTradePrograms) {
      return;
    }
    // get the search keyword
    let search = this.filterTradeProgram.value;
    if (!search) {
      this.filteredTradeProgram.next(this.listTradePrograms.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredTradeProgram.next(
      this.listTradePrograms.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  importAudience() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { password: "P@ssw0rd" };

    this.dialogRef = this.dialog.open(
      ImportNotesDialogComponent,
      dialogConfig
    );

    this.dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.dataService.showLoading(true);
        let rows = this.rows.map((row) => row.id);
        this.idbService
          .getAll((dt) => dt.is_valid)
          .then((result) => {
            // console.log("result", result);
            this.onSelect({ selected: result });
            this.dialogService.openSnackBar({
              message: this.ls.locale.global.messages.text8,
            });
            this.dataService.showLoading(false);
          });
      }
    });
  }
  searchingRetailer(res) {
    let areaSelected = Object.entries(this.formFilter.getRawValue())
      .map(([key, value]) => ({ key, value }))
      .filter(
        (item: any) =>
          item.value !== null && item.value !== "" && item.value.length !== 0
      );
    let area_id = areaSelected[areaSelected.length - 1].value;
    let areaList = [
      "national",
      "division",
      "region",
      "area",
      "salespoint",
      "district",
      "territory",
    ];

    if (
      this.areaFromLogin[0].length === 1 &&
      this.areaFromLogin[0][0].type === "national" &&
      this.pagination.area !== 1
    ) {
      this.pagination["after_level"] = true;
    } else {
      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(
        this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type
      );
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
      let is_area_2 = false;

      let self_area = this.areaFromLogin[0]
        ? this.areaFromLogin[0].map((area_1) => area_1.id)
        : [];
      let last_self_area = [];
      if (self_area.length > 0) {
        last_self_area.push(self_area[self_area.length - 1]);
      }

      if (this.areaFromLogin[1]) {
        let second_areas = this.areaFromLogin[1];
        last_self_area = [
          ...last_self_area,
          second_areas[second_areas.length - 1].id,
        ];
        self_area = [
          ...self_area,
          ...second_areas
            .map((area_2) => area_2.id)
            .filter((area_2) => self_area.indexOf(area_2) === -1),
        ];
      }

      let newLastSelfArea = this.checkAreaLocation(
        areaSelected[areaSelected.length - 1],
        last_self_area
      );

      if (this.pagination["after_level"]) delete this.pagination["after_level"];
      this.pagination["self_area"] = self_area;
      this.pagination["last_self_area"] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0])
        levelCovered = this.areaFromLogin[0].map((level) =>
          this.parseArea(level.type)
        );
      if (
        lastSelectedArea.value.length === 1 &&
        this.areaFromLogin.length > 1
      ) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(
          (are) => are.id === oneAreaSelected
        );
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        // console.log(
        //   "last self area",
        //   last_self_area,
        //   is_area_2,
        //   levelCovered,
        //   levelCovered.indexOf(lastSelectedArea.key) !== -1,
        //   lastSelectedArea
        // );
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2)
            this.pagination["last_self_area"] = [last_self_area[1]];
          else this.pagination["last_self_area"] = [last_self_area[0]];
        } else {
          this.pagination["after_level"] = true;
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        this.pagination["after_level"] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination["last_self_area"] = newLastSelfArea;
        }
      }
    }

    this.loadingIndicator = true;
    this.pagination.area = area_id;

    this.audienceService.getListRetailer(this.pagination).subscribe(
      (res) => {
        this.rows = res["data"];
        this.loadingIndicator = false;
      },
      (err) => {
        this.loadingIndicator = false;
      }
    );
  }

  changeValue() {
    if (this.formAudience.get("limit").value === "pick-all") {
      this.selected = this.rows;
    } else {
      this.selected = [];
    }
  }

  getRows(id) {
    let index = this.rows.map((item) => item.id).indexOf(id);
    return this.rows[index];
  }

  findInvalidControls() {
    const invalid = [];
    const controls = this.formAudience.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  async exportAudience() {
    this.exportTemplate = true;
    const body = {
      retailer_id:
        this.selected.length > 0 ? this.selected.map((item) => item.id) : [],
    };

    try {
      const response = await this.audienceService.exportExcel(body).toPromise();
      this.downloadLink.nativeElement.href = response.data;
      this.downloadLink.nativeElement.click();
      this.exportTemplate = false;
    } catch (error) {
      this.exportTemplate = false;
      throw error;
    }
  }
}
