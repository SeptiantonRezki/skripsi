import {
  Component,
  OnInit,
  // HostListener,
  ViewChild,
  // ElementRef,
  // SimpleChanges,
} from "@angular/core";
// import { formatCurrency } from "@angular/common";
import {
  Router,
  // ActivatedRoute
} from "@angular/router";
import { DataService } from "../../../services/data.service";
import { DialogService } from "../../../services/dialog.service";
import { MasterKPIService } from "../../../services/kpi-setting/master-kpi.service";
import {
  Subject,
  // Observable,
  //  ReplaySubject
  } from "rxjs";
// import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
// import { takeUntil } from "rxjs/operators";
import { Page } from "../../../classes/laravel-pagination";
import * as _ from "underscore";
// import { environment } from "environments/environment";
// import { IdbService } from "app/services/idb.service";
import { KPISettingService } from "../../../services/kpi-setting/kpi-setting.service";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import moment from "moment";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { debounce } from "lodash";
import { SalestreeComponent } from "app/shared/salestree/salestree.component";
import { DatatableComponent } from "@swimlane/ngx-datatable";

type LeveledArea = {
  area_level: string;
  area_code: string;
};

@Component({
  selector: "app-list-kpi-groups.component",
  templateUrl: "./list-kpi-groups.component.html",
  styleUrls: ["./list-kpi-groups.component.scss"],
})
export class KPIGroupsList implements OnInit {
  @ViewChild(SalestreeComponent) child: SalestreeComponent;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  formKPI: FormGroup;
  formdataErrors: any;
  rows: any[];
  pagination: Page = new Page();
  offsetPagination: any;
  id: any;
  loadingIndicator: Boolean;
  keyUp = new Subject<string>();
  lastLevel: any;
  areas: any;
  tradeProgramList: any = [];
  scrollTradeProgram: boolean = true;
  init: boolean = true;
  existingAreas = [];
  limitArea: any = {};
  paramEdit: any = null;
  levelAreas = [
    "national",
    "division",
    "region",
    "area",
    "salespoint",
    "district",
    "territory",
  ];
  statusOptions = ["active", "inactive"];
  limitAreaIndex: number = 0;
  areaFromLogin: any;
  KPSListStart: any[] = [];
  KPSListEnd: any[] = [];
  KPSListCat: any[] = [];
  categories = [
    // { id: "visit", name: "Visit" },
    { id: "brand", name: "Brand" },
    { id: "trade program", name: "Trade Program" },
    { id: "ecosystem", name: "Ecosystem" },
  ];
  // isResetting:boolean = false
  // limitArea: any = {};

  tradeProgramListReserved: any = [];

  constructor(
    private kpiSettingService: KPISettingService,
    private dataService: DataService,
    private dialogService: DialogService,
    private masterKPIService: MasterKPIService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.areaFromLogin = this.dataService.getDecryptedProfile()["areas"];
    // console.log(this.areaFromLogin)
    this.setLimitArea(this.areaFromLogin);
    this.handleChange = debounce(this.handleChange, 1000);
    this.handleReset = debounce(this.handleReset, 1000);
    // console.log(this.dataService.getDecryptedProfile()["areas"])
  }

  setLimitArea(data: any) {
    data.forEach((item: any) => {
      if (Array.isArray(item)) {
        this.setLimitArea(item);
      } else {
        const itemIndex = this.levelAreas.indexOf(item.level_desc);
        if (!this.limitArea.hasOwnProperty(item.level_desc))
          this.limitArea[item.level_desc] = [];
        if (this.limitAreaIndex < itemIndex) this.limitAreaIndex = itemIndex;
        this.limitArea[item.level_desc].push(item.id);
      }
    });
  }

  checkKPIDate(dateStart: string, dateEnd: string) {
    const dateNow = new Date().getFullYear();
    const dateStartYear = new Date(dateStart).getFullYear();
    const dateEndYear = new Date(dateEnd).getFullYear();
    if (dateStartYear !== dateNow || dateEndYear !== dateNow) {
      return false;
    }
    return true;
  }
  isArrayDiffer(arr1: any, arr2: any) {
    let differ = [];
    if (arr1.length > arr2.length) {
      differ = arr1.filter((item: any) => !arr2.includes(item));
    } else {
      differ = arr2.filter((item: any) => !arr1.includes(item));
    }
    return differ.length > 0;
  }

  getCombineAreas() {
    let existingAreaIds = this.existingAreas.map((area) => area.id);
    let areaIDs = this.lastLevel.id;

    const accountAreaIds = Array.from(
      new Set([...this.limitArea[this.levelAreas[this.limitAreaIndex]]])
    );

    let newAreaIDs = existingAreaIds.length
      ? this.isArrayDiffer(areaIDs, accountAreaIds)
        ? [...existingAreaIds, ...areaIDs]
        : [...existingAreaIds]
      : this.isArrayDiffer(areaIDs, accountAreaIds)
      ? [...areaIDs]
      : [...accountAreaIds];
    newAreaIDs = Array.from(new Set<number>(newAreaIDs));
    return newAreaIDs;
  }

  getFileExport() {
    const param = this.getParamList();
    this.kpiSettingService.export(param).subscribe((res) => {
      let link = document.createElement("a");
      link.href = res.data;
      link.download = "kpi-setting.xlsx";
      link.click();
    });
  }

  getKpis(pos?: number) {
    const kpis = this.formKPI.controls.kpis as FormArray;
    return pos >= 0 ? kpis.at(pos) : kpis.controls;
  }

  getTradeProgramList(params: any = {}) {
    const kpis: any = this.getKpis();
    const areaIds = this.getCombineAreas();
    this.masterKPIService
      .getTradeProgramObjectives({ area_id: areaIds.join(","), ...params })
      .subscribe((res) => {
        const data = res.data.map(({ trade_program_name }) => ({
          id: trade_program_name,
          name: trade_program_name,
        }));
        this.tradeProgramList =
          params.hasOwnProperty("page") && params.page > 1
            ? [...this.tradeProgramList, ...data]
            : data;
        if (this.init) {
          this.tradeProgramList = [
            ...this.tradeProgramListReserved,
            ...this.tradeProgramList,
          ];
          this.init = false;
        }
        for (let kpi of kpis) {
          if (kpi.get("category").value === "trade program") {
            const exists = this.tradeProgramList.find(
              ({ id }) => id == kpi.get("parameter").value
            );
            if (!exists) kpi.get("parameter").setValue("");
          }
        }
        this.scrollTradeProgram = res.data.length > 0;
      });
  }

  getAreaIds(lastSelected: any) {
    const [id, key, onClick] = lastSelected;
    this.lastLevel = { id, key };
    if (id != 1) this.handleChange();
    if (id == 1) this.getListInit();
    // console.log(id, this.lastLevel);
    // if (onClick) {
    //   this.getTradeProgramList();
    // }
  }

  getAreas(areas: any) {
    this.areas = areas;
  }

  handleReset() {
    // reset form
    this.formKPI.get("search").setValue(null);
    this.formKPI.get("kategori").setValue(null);
    this.formKPI.get("start_kps").setValue(null);
    this.formKPI.get("end_kps").setValue(null);
    this.formKPI.get("status").setValue(null);
    this.child.resetAllLevel();
    this.table.sorts = [];
    this.areas = [];
    this.lastLevel = { id: [1], key: "national" };
    // let newAreaIDs = this.getCombineAreas();
    // console.log(newAreaIDs);
    // console.log(this.areas, this.limitArea, this.lastLevel, this.existingAreas)

    this.getListInit();
  }

  // handleArea(data: LeveledArea[]) {
  //   let districts,
  //     territories,
  //     areasZone,
  //     regions,
  //     zones,
  //     nationals = [];

  //   territories = data
  //     .filter((data) => data.area_level.toLowerCase() === "teritory")
  //     .map((data) => data.area_code);
  //   districts = data
  //     .filter((data) => data.area_level.toLowerCase() === "district")
  //     .map((data) => data.area_code);
  //   areasZone = data
  //     .filter((data) => data.area_level.toLowerCase() === "area")
  //     .map((data) => data.area_code);
  //   regions = data
  //     .filter((data) => data.area_level.toLowerCase() === "region")
  //     .map((data) => data.area_code);
  //   zones = data
  //     .filter((data) => data.area_level.toLowerCase() === "division")
  //     .map((data) => data.area_code);
  //   // nationals = data
  //   //   .filter((data) => data.area_level.toLowerCase() === "national")
  //   //   .map((data) => data.area_code);

  //   return { territories, areasZone, regions, zones, districts, nationals };
  // }

  getListInit() {
    // set list to desc
    this.dataService.setToStorage("sort", "");
    this.dataService.setToStorage("sort_type", "");

    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? page - 1 : 0;
    this.kpiSettingService.getListV2(this.pagination).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.table.offset = 0;
      this.rows = res.data.map((data) => {
        // const { territories, districts, regions, areasZone, zones } =
        //   this.handleArea(data.leveled_areas);
        // territories:data.leveled_areas.filter(data => data.area_level.toLowerCase() === 'teritory'),
        return {
          ...data,
          // territories,
          // districts,
          // regions,
          // zones,
          // // nationals,
          // areasZone,
          isEditable: this.checkKPIDate(data.start_date, data.end_date),
        };
      });
    });

    // this.isResetting = false
  }

  ngOnInit() {
    // this.getListInit();

    this.formKPI = this.formBuilder.group({
      start_kps: [null],
      end_kps: [null],
      status: [""],
      kategori: [null],
      search: [null],
      // kpis: this.formBuilder.array([]),
    });

    this.formKPI.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formKPI, this.formdataErrors);
    });

    this.kpiSettingService.getKPSV2(this.paramEdit).subscribe((res) => {
      this.KPSListStart = res.map((item: any) => ({
        id: item.id,
        name: this.getKPSLabel(item, "start_date"),
      }));
      this.KPSListEnd = res.map((item: any) => ({
        id: item.id,
        name: this.getKPSLabel(item, "end_date"),
      }));
    });
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   console.log("here", changes);
  // }

  // handleChange(e) {
  //   let newAreaIDs = this.getCombineAreas();
  //   console.log(this.formKPI, newAreaIDs);
  // }

  getKPSLabel(data: any, date: string) {
    return `${data["kps_number"]} - ${moment(data[date], "YYYY-MM-DD").format(
      "DD/MM/YYYY"
    )}`;
  }

  getParamList() {
    let newAreaIDs = this.getCombineAreas();
    const param = {
      ...this.pagination,
      area: newAreaIDs[0] == 1 ? "" : JSON.stringify([...newAreaIDs]),
      search_field: this.formKPI.get("search").value,
      category: this.formKPI.get("kategori").value,
      // status: this.formKPI.get("status").value ? "active" : "inactive",
      status: this.formKPI.get("status").value,
      end_kps: this.formKPI.get("end_kps").value,
      start_kps: this.formKPI.get("start_kps").value,
    };
    return param;
    // console.log(newAreaIDs);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;
    let param = this.getParamList();
    this.kpiSettingService.getListV2(param).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map((data) => {
        // const { territories, districts, regions, areasZone, zones } =
        // this.handleArea(data.leveled_areas);
        // territories:data.leveled_areas.filter(data => data.area_level.toLowerCase() === 'teritory'),
        return {
          ...data,
          // territories,
          // districts,
          // regions,
          // zones,
          // // nationals,
          // areasZone,
          isEditable: this.checkKPIDate(data.start_date, data.end_date),
        };
      });
      this.loadingIndicator = false;
    });
    // console.log(res)
  }

  handleChange(e?) {
    // console.log(e);
    // let newAreaIDs = this.getCombineAreas();
    // console.log(param);
    this.pagination.page = 1;
    this.offsetPagination = 1;
    this.loadingIndicator = true;
    this.dataService.setToStorage("page", this.pagination.page);
    const param = this.getParamList();
    this.kpiSettingService.getListV2(param).subscribe((res) => {
      Page.renderPagination(this.pagination, {
        ...res,
        page: res.current_page,
      });
      this.table.offset = 0;
      this.rows = res.data.map((data) => {
        // const { territories, districts, regions, areasZone, zones } =
        // this.handleArea(data.leveled_areas);
        // territories:data.leveled_areas.filter(data => data.area_level.toLowerCase() === 'teritory'),
        return {
          ...data,
          // territories,
          // districts,
          // regions,
          // zones,
          // // nationals,
          // areasZone,
          isEditable: this.checkKPIDate(data.start_date, data.end_date),
        };
      });

      this.loadingIndicator = false;
    });
    // const param = {
    //   ...this.pagination,
    //   area:newAreaIDs,
    //   search_field:this.formKPI.get("search").value,
    //   category:this.formKPI.get("kategori").value,
    //   status:this.formKPI.get("status").value ? "active": "inactive",
    //   end_date:this.formKPI.get("end_kps").value,
    //   start_date:this.formKPI.get("start_kps").value,
    // }
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    const param = this.getParamList();

    this.kpiSettingService.getListV2(param).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map((data) => {
        // const { territories, districts, regions, areasZone, zones } =
        //   this.handleArea(data.leveled_areas);
        // territories:data.leveled_areas.filter(data => data.area_level.toLowerCase() === 'teritory'),
        return {
          ...data,
          // territories,
          // districts,
          // regions,
          // zones,
          // // nationals,
          // areasZone,
          isEditable: this.checkKPIDate(data.start_date, data.end_date),
        };
      });

      this.loadingIndicator = false;
    });
  }

  edit(param?: any): void {
    this.rows = [];
    this.dataService.setToStorage("kpi-group", param);
  }

  delete(id) {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    this.id = id;
    let data = {
      titleDialog: "Hapus KPI Group",
      captionDialog: "Apakah anda yakin untuk menghapus KPI group ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"],
    };
    this.dialogService.openCustomConfirmationDialog(data);
    this.dataService.showLoading(false);
    this.loadingIndicator = false;
    this.router.navigate(["kpisetting", "kpi-groups-list"]);
  }

  confirmDelete(id) {
    this.kpiSettingService.delete(this.id).subscribe((res) => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.ngOnInit();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }
}


