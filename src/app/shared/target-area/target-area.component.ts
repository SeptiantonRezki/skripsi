import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Page } from "app/classes/laravel-pagination";
import { AreaService } from "app/services/area.service";
import { DataService } from "app/services/data.service";
import { DialogService } from "app/services/dialog.service";
import { GeotreeService } from "app/services/geotree.service";
import { Observable, Subject } from "rxjs";
import { DialogImportComponent } from "./dialog-import/dialog-import.component";

@Component({
  selector: "target-area",
  templateUrl: "./target-area.component.html",
  styleUrls: ["./target-area.component.scss"],
})
export class TargetAreaComponent implements OnInit {
  @Output() selectedArea: EventEmitter<any[]> = new EventEmitter();
  @Output() selectedAll: EventEmitter<boolean> = new EventEmitter();
  @Output() selectedAllId: EventEmitter<any[]> = new EventEmitter();
  @Input() areas: any[] = [];

  geoLevel: string[] = ["national", "division", "region", "area"];
  geoList: any = {
    national: [
      {
        id: 1,
        parent_id: null,
        code: "SLSNTL",
        name: "SLSNTL",
      },
    ],
  };
  formGeo: FormGroup;
  onLoad: boolean = true;
  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  pagination: Page = new Page();
  offsetPagination: any;
  rows: any[] = [];
  selected: any[] = [];
  isSelectedAll: boolean = false;

  dialogRef: any;

  keyUp = new Subject<string>();

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  @ViewChild("downloadLink") downloadLink: ElementRef;

  constructor(
    private fb: FormBuilder,
    private geoService: GeotreeService,
    private areaService: AreaService,
    private dataService: DataService,
    public dialogService: DialogService,
    public dialog: MatDialog
  ) {
    this.keyUp
      .debounceTime(500)
      .distinctUntilChanged()
      .flatMap((search) => {
        return Observable.of(search).delay(500);
      })
      .subscribe((data) => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.createForm();

    // reset pagination
    this.dataService.setToStorage("page", "");
    this.dataService.setToStorage("sort", "");
    this.dataService.setToStorage("sort_type", "");
    this.dataService.setToStorage("search", "");

    this.dataService.showLoading(true);
    this.getLevel("national");
  }

  ngOnChanges(data) {
    if (!data) return;

    const areas = data.areas.currentValue;
    if (areas.length) {
      this.onSelect({ selected: areas });
    }
  }

  createForm() {
    this.formGeo = this.fb.group({
      national: [{ value: [1], disabled: true }],
      division: [""],
      region: [""],
      area: [""],
    });
  }

  getArea() {
    const area = this.formGeo.get("area").value;
    const page = this.dataService.getFromStorage("page");
    const sort = this.dataService.getFromStorage("sort");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const search = this.dataService.getFromStorage("search");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination.search = search;
    this.offsetPagination = page ? page - 1 : 0;

    this.loadingIndicator = true;
    this.areaService
      .get({
        ...this.pagination,
        area_ids: area.length ? area.join() : "",
      })
      .subscribe((res) => {
        this.dataService.showLoading(false);
        this.loadingIndicator = false;
        this.rows = res.data ? res.data : [];
        Page.renderPagination(this.pagination, res);

        if (this.isSelectedAll) {
          this.onSelect({ selected: res.data });
        }
      });
  }

  getLevel(value: string) {
    const level = this.formGeo.get(value).value;
    const index = this.geoLevel.indexOf(value);

    if (index + 1 <= this.geoLevel.length) {
      this.resetLevel(value);

      const fd = new FormData();
      const subLevel = this.geoLevel[index + 1];
      fd.append("area_type", subLevel);

      if (level.length) {
        level.forEach((item: any) => {
          fd.append("area_id[]", item);
        });
      } else {
        fd.append("area_id[]", "");
      }

      this.geoService.getChildFilterArea(fd).subscribe((res) => {
        this.geoList[subLevel] = res.data;
      });
    }

    this.getArea();
    if (this.isSelectedAll) this.getAllId();
  }

  resetLevel(value) {
    let current = false;
    this.geoLevel.forEach((item) => {
      if (item === value) {
        current = true;
        return;
      }
      if (current) {
        this.formGeo.get(item).setValue("");
        this.geoList[item] = [];
      }
    });
  }

  updateFilter(value) {
    this.dataService.setToStorage("page", 1);
    this.dataService.setToStorage("search", value);

    this.getArea();
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;

    if (!this.pagination["search"]) {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
    }

    this.getArea();
  }

  onSort(event: any) {
    const sortName = event.column.prop.split(".")[0];

    this.dataService.setToStorage("sort", sortName);
    this.dataService.setToStorage("sort_type", event.newValue.toUpperCase());

    this.getArea();
  }

  getRowId(row: any) {
    return row.id;
  }

  setAllSelected(state: boolean) {
    if (this.isSelectedAll !== state) {
      this.isSelectedAll = state;
      this.selectedAll.emit(state);
      if (state) this.getAllId();
    }
    return state;
  }

  getAllId() {
    let levelId = [];
    this.geoLevel.forEach((item) => {
      let lastLevel = this.formGeo.get(item).value;
      if (!lastLevel.length) return false;
      levelId = lastLevel;
    });
    this.selectedAllId.emit(levelId);
  }

  onSelect({ selected }) {
    let items = [...selected];
    this.selected.splice(0, items.length);
    this.selected = items;
    this.selectedArea.emit(this.selected);
  }

  import() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";

    this.dialogRef = this.dialog.open(DialogImportComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
        this.dialogService.openSnackBar({ message: "File berhasil diimport" });
        this.onSelect({ selected: res });
      }
    });
  }

  async export() {
    if (!this.selected.length) {
      this.dialogService.openSnackBar({
        message: "Pilih area untuk di ekspor!",
      });
      return;
    }
    try {
      const fd = new FormData();
      this.selected.forEach((item) => {
        fd.append("selected[]", item.id);
      });

      this.dataService.showLoading(true);
      const response = await this.areaService.export(fd).toPromise();
      this.downLoadFile(
        response,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        `Area_${new Date().toLocaleString()}.xls`
      );
      this.dataService.showLoading(false);
    } catch (error) {
      this.dataService.showLoading(false);
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    var newBlob = new Blob([data], { type: type });

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
    );

    setTimeout(function () {
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }
}