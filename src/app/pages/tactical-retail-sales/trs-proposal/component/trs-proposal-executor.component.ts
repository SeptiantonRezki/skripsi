import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { DataService } from 'app/services/data.service';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, forkJoin } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { IdbService } from 'app/services/idb.service';
import { TacticalRetailSalesService } from "app/services/tactical-retail-sales.service";
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './trs-proposal-executor.component.html',
  styleUrls: ['./trs-proposal-executor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TrsProposalExecutorComponent {

  formExecutor: FormGroup;
  formFilter: FormGroup;

  loaded: Boolean;
  loadingIndicator = false;
  reorderable = true;
  onLoad: boolean;

  rows: any[] = [];
  temp: any[] = [];

  selected: any[];
  detailData: any;

  selectedMitra: any[] = [];
  profile: any;

  previewData: any = {
    is_valid: 0,
    preview_id: null,
    preview_task_id: null,
    total_selected: 0,
  };

  totalData: number = 0;
  checkDisabled: boolean = false;

  salespointList: any[];
  districtList: any[];
  statusList: any[] = [
    { name: 'Semua', value: '' }, 
    { name: 'Dapat diassign di TRS program ini', value: 'bisa' },
    { name: 'Sudah diassign di TRS program ini', value: 'sedang' },
    { name: 'Sudah diassign di TRS program lain', value: 'lain' },
  ];

  filterSalespoint: any = "";
  filterDistrict: any = "";
  filterStatus: any = "";
  filterSearch: any = "";

  multiSales: boolean = true;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    public dialogRef: MatDialogRef<TrsProposalExecutorComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private audienceService: AudienceService,
    private dataService: DataService,
    private TRSService: TacticalRetailSalesService,
    private idbService: IdbService,
    private ls: LanguagesService,
    @Inject(MAT_DIALOG_DATA) data: any,
    private translate: TranslateService,
  ) {
    this.selected = [];
    this.detailData = data;
    this.profile = null;
    this.dataService.showLoading(false);

    console.log(this.detailData.area);
  }

  ngOnInit() {
    this.formExecutor = this.formBuilder.group({
    });

    this.aturPanelMitra();
  }

  getId(row) {
    return row.id;
  }

  onSelect({ selected }) {
    // console.log(arguments);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    console.log("onselected");
    console.log(this.selected);
  }

  onCheckboxChange(event: any, row: any) {
    /*
    if (event) {
      const temp = [...this.selected];
      const selectedItem = { ...this.selected.filter((s: any) => s.id === row.id)[0] };
      const indexFind = this.selected.findIndex((i: any) => i.id === row.id);
      selectedItem['isHub'] = event.checked;
      if (indexFind !== -1) {
        temp[indexFind] = selectedItem;
        this.selected = temp;
      }
    }
    */
    if(this.selected.length >= this.detailData.max){
      //alert("jumlah executor sudah sesuai, jangan memilih lagi !");
      this.checkDisabled = true;
    } else if(this.selected.length < this.detailData.max){
      this.checkDisabled = false;
    }
  }

  submit() {
    if (this.selected.length > 0) {
      this.dialogRef.close(this.selected);
    } else {
      this.dialogService.openSnackBar({ message: "Minimal pilih 1 !" }); // TODO
    }
  }

  updateFilter(event) {
    console.log("keyup");
    const val = event.target.value.toLowerCase();
    this.filterSearch = val;

    this.updateTable();
  }

  changeSales(e: any) {
    this.filterSalespoint = e.value.toLowerCase();

    if (this.multiSales){
      this.districtList = this.rows.map(a => a.district.trim());
      this.districtList = this.districtList.filter((x, i, a) => a.indexOf(x) == i);
    }

    this.updateTable();
  }

  changeDistrict(e: any) {
    this.filterDistrict =  e.value.toLowerCase();
    this.updateTable();
  }

  updateTable(){
    //filterSalespoint: any = "";
    //filterDistrict: any = "";
    //filterStatus: any = "";
    //filterSearch: any = "";
    let temp = this.temp;

    if (this.filterSalespoint != ""){
      const val = this.filterSalespoint;
      temp = temp.filter(function (d) {
        return d.salespoint.toLowerCase().indexOf(val) !== -1;
      });
    }

    if (this.filterDistrict != ""){
      const val = this.filterDistrict;
      temp = temp.filter(function (d) {
        return d.district.toLowerCase().indexOf(val) !== -1;
      });
    }

    if (this.filterStatus != ""){
      temp = temp.filter(function (d) {
        return d.status.toLowerCase().indexOf(this.filterStatus) !== -1;
      });
    }

    if (this.filterSearch != ""){
      const val = this.filterSearch;
      temp = temp.filter(function (d) {
        return d.fullname.toLowerCase().indexOf(val) !== -1 ||
               d.username.toLowerCase().indexOf(val) !== -1 ||
               d.salespoint.toLowerCase().indexOf(val) !== -1 ||
               d.district.toLowerCase().indexOf(val) !== -1 ||
               d.territory.toLowerCase().indexOf(val) !== -1 || 
               !val;
      });
    }

    // update the rows
    this.rows = temp;
  }

  aturPanelMitra() {
    this.selectedMitra = [];
    //this.onSelect({ selected: [] });

    this.dataService.showLoading(true);

    let request = {
      level: 6,
      area_id: this.detailData.area
    };

    this.TRSService.getExecutor(request).subscribe(res => {
      this.loaded = true;
      this.rows = res.data;
      this.temp = [...res.data];
      this.salespointList = this.rows.map(a => a.salespoint.trim());
      this.salespointList = this.salespointList.filter((x, i, a) => a.indexOf(x) == i);

      if (this.salespointList.length == 1){
        this.districtList = this.rows.map(a => a.district.trim());
        this.districtList = this.districtList.filter((x, i, a) => a.indexOf(x) == i);
        this.multiSales = false;
      } else if (this.salespointList.length > 1){
        this.multiSales = true;
      }

      if (this.detailData.selected != ""){
        let IDselected = (this.detailData.selected).split('__');

        for (let index = 0; index < this.rows.length; index++) {
          if (IDselected.includes(this.rows[index].id)){
            this.selected.push(this.rows[index]);
          }
        }

        if(this.selected.length >= this.detailData.max){
          //alert("jumlah executor sudah sesuai, jangan memilih lagi !");
          this.checkDisabled = true;
        } else if(this.selected.length < this.detailData.max){
          this.checkDisabled = false;
        }
      }

      this.dataService.showLoading(false);

    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
    })
  }
}
