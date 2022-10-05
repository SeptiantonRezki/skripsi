import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { NewSignService } from 'app/services/settings/new-sign.service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { GeotreeService } from 'app/services/geotree.service';
import { NotificationService } from 'app/services/notification.service';
import { RetailerService } from 'app/services/user-management/retailer.service';
import * as _ from "lodash";
import moment from 'moment';
import { Router } from '@angular/router';
import { TacticalRetailSalesService } from "app/services/tactical-retail-sales.service";
import { TrsProposalExecutorComponent } from "../component/trs-proposal-executor.component";
import { TrsProposalKecamatanComponent } from "../component/trs-proposal-kecamatan.component";
import { TrsProposalProductComponent } from "../component/trs-proposal-product.component";
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';

import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";

@Component({
  selector: 'app-trs-proposal-create',
  templateUrl: './trs-proposal-create.component.html',
  styleUrls: ['./trs-proposal-create.component.scss']
})
export class TrsProposalCreateComponent implements OnInit {
  formCreateProposal: FormGroup;
  formFilter: FormGroup;
  onLoad: boolean;
  loadingIndicator: boolean;
  showLoading: Boolean;
  listLevelArea: any[];
  indexDelete: any;
  list: any;
  typeArea: any[] = ["area", "salespoint"];
  areaFromLogin;

  rows: any[];
  selected: any[] = [];
  id: any[];
  reorderable = true;
  pagination: Page = new Page();

  keyUp = new Subject<string>();
  areaType: any[] = [];

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;
  menuList: any[] = [];
  iconList: any[] = [];
  areaIdNonTargetAudience: any = 1;

  opsiGeotagging = [
    { name: 'Wajib', value: 'wajib' },
    { name: 'Optional', value: 'optional' },
  ];

  keyUpCust1 = new Subject<string>();
  keyUpCust2 = new Subject<string>();

  dialogRef: any;
  importingDataStatus = {
    import_audience_status: null,
    import_audience_status_type: null
  }

  minDateProposal: any = new Date();
  minMaxDateProposal: any = new Date();
  maxDateProposal: any = new Date();
  maxPeriodProposal: any = 60;

  selectedArea: any = [""];
  selectedSalesPoint: any = "";

  selectedExecutor: any = [];
  selectedKecamatan: any = [];
  selectedProduct: any = [];

  imageSku: any;
  files: File;
  fileList: Array<File> = [];
  validComboDrag: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private newSignService: NewSignService,
    private geotreeService: GeotreeService,
    private TRSService: TacticalRetailSalesService,
    private notificationService: NotificationService,
    private retailerService: RetailerService,
    private dialog: MatDialog,
    private router: Router,
    private ls: LanguagesService
  ) {
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];

    //HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
    //let areas = this.dataService.getDecryptedProfile()['areas'] || [];

    this.selected = [];

    this.list = {
      salespoint: [],
    }

    this.maxDateProposal.setDate(this.minDateProposal.getDate() + this.maxPeriodProposal);
  }

  ngOnInit() {

    this.formCreateProposal = this.formBuilder.group({
      areas: this.formBuilder.array([]),
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      geotagging: ['wajib', Validators.required],
      custCode1: ["", Validators.required],
      custName1: ["", Validators.required],
      custCode2: [""],
      custName2: [""],
      maxExecutor: [1, Validators.required],      
      flowingly: [""],
      
      executor: [""],
      kecamatan: [""],
      product: [""],

      //kanan
      executor_selected: ["", Validators.required],
      kecamatan_selected: ["", Validators.required],
      product_selected: ["", Validators.required],

      background: ["", Validators.required],
      objective: ["", Validators.required],

      area: [""],
      salespoint: [""],
    })


    // =========== GET AREA AWAL ===========
    let areas = this.dataService.getDecryptedProfile()['area_id'];

    let request = {
      level: 4, // area
      area_id: areas
    };

    this.TRSService.getAreaByUser(request).subscribe(res => {
      this.listLevelArea = res.data;
      this.addArea();
    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
    })


    // ============== SET END DATE ================
    this.TRSService.getSysVar().subscribe((res) => {
      res.data.forEach((item) => {
        if (item.param === 'max_period') {
          this.maxPeriodProposal = parseInt(item.value);
        }
      });
    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
    })
    

    this.keyUpCust1.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        this.setCustName(res, 'custName1');
      });

    this.keyUpCust2.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        this.setCustName(res, 'custName2');
      });
  }

  
  changeFile(evt) {
    this.readThis(evt);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    if (file.size > 2000000) {
      this.dialogService.openSnackBar({
        message: "File melebihi maksimum 2mb!"
      });
      return;
    }
    this.fileList = [
      ...this.fileList,
      file
    ];

    console.log("this.fileList");
    console.log(this.fileList);
  }

  removeImage(idx) {
    console.log('index you find!', idx);
    this.fileList.splice(idx, 1);
  }

  setMinDate(param?: any): void {
    this.formCreateProposal.get("endDate").setValue("");
    this.minMaxDateProposal = param;
    console.log("kaaaa");
    console.log(this.maxPeriodProposal);
    this.maxDateProposal = moment(param).add(parseInt(this.maxPeriodProposal), 'd');
  }

  submit() {
    console.log("qqqq");
    if (this.formCreateProposal.valid) {
      this.dataService.showLoading(true);
      let fd = new FormData();
      //fd.append('program_code', "XXX_Coba1"); generate di backend saja
      fd.append('start_date', moment(this.formCreateProposal.get('startDate').value).format("YYYY-MM-DD"));
      fd.append('end_date', moment(this.formCreateProposal.get('endDate').value).format("YYYY-MM-DD"));
      fd.append('area_id', this.selectedArea);
      fd.append('salespoint_id', this.selectedSalesPoint);

      fd.append('customer1_code', this.formCreateProposal.get('custCode1').value);
      fd.append('customer1_name', this.formCreateProposal.get('custName1').value);
      fd.append('customer2_code', this.formCreateProposal.get('custCode2').value);
      fd.append('customer2_name', this.formCreateProposal.get('custName2').value);
      
      fd.append('background', this.formCreateProposal.get('background').value);
      fd.append('objective', this.formCreateProposal.get('objective').value);
      fd.append('max_executor', this.formCreateProposal.get('maxExecutor').value);
      fd.append('flowingly', this.formCreateProposal.get('flowingly').value);
      
      fd.append('geotag_flag', this.formCreateProposal.get('geotagging').value);

      fd.append('executors', this.selectedExecutor);
      fd.append('kecamatans', this.selectedKecamatan);
      fd.append('products', this.selectedProduct);

      this.fileList.map(imgr => {
        fd.append('files[]', imgr)
      })

      this.TRSService.putProposal(fd).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.router.navigate(['/tactical-retail-sales', 'trs-proposal']);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });
      commonFormValidator.validateAllFields(this.formCreateProposal);
    }
  }

  batal(){
    var result = confirm("Jika kembali, semua data yang sudah diisi akan hilang. Yakin akan kembali ke TRS List?");
    if (result) {
      this.router.navigate(['/tactical-retail-sales', 'trs-proposal']);
    }
  }

  setCustName(id, component_name): void {
    if (id) {
      if (id.length == 10) {
        if (this.selectedSalesPoint == ""){
          alert("Pilih salespoint terlebih dahulu !");
        } else {
          id = id+"__"+this.selectedSalesPoint;
          this.dataService.showLoading(true);
          this.TRSService.getCustName(id.toUpperCase()).subscribe(res => {
            this.dataService.showLoading(false);
            if (res.status ==  'success'){
              this.formCreateProposal.get(component_name).setValue(res.data.name);
            } else {
              alert(res.message);
              this.formCreateProposal.get(component_name).setValue("");
            }
          }, err => {
            this.dataService.showLoading(false);
            console.log('err occured', err);
          })
        }
      }
    }
  }

  modalExecutor() {
    if (this.selectedArea == ""){
      alert("Tunggu, data Area sedang di load");
    } else {
      const dialogConfig = new MatDialogConfig();
      const formCreateProposal = this.formCreateProposal.getRawValue();
  
      dialogConfig.maxWidth = "90vw";
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = 'scrumboard-card-dialog';
      dialogConfig.data = {
        password: 'P@ssw0rd',
        IMPORT_FROM_METHOD: 'CREATE',
        max: this.formCreateProposal.get('maxExecutor').value,
        area: this.selectedArea,
        selected: this.selectedExecutor,
        formCreateProposal,
      };
  
      this.dialogRef = this.dialog.open(TrsProposalExecutorComponent, dialogConfig);
  
      this.dialogRef.afterClosed().subscribe(response => {
        
        console.log("kakakaka");
        console.log(response);
        var result = [];
        var result_id = [];
        if (typeof response !== "undefined") {
          response.forEach(function (item) {
            result_id.push(item.id);
            
            if (item.territory != "" && item.territory != "-"){
              result.push(item.fullname + " (" + item.territory.trim() + ")");
            } else {
              if (item.district == "" || item.district == "-"){
                result.push(item.fullname + " (" + item.salespoint.trim() + ")");
              } else {
                result.push(item.fullname + " (" + item.district.trim() + ")");
              }
            }
          });
  
          this.selectedExecutor = result_id.join("__");
          this.formCreateProposal.get('executor_selected').setValue(result.join(", "));
  
          console.log(result);
        }
      });
    }
  }

  modalKecamatan() {
    if (this.selectedSalesPoint == ""){
      alert("Pilih salespoint terlebih dahulu !");
    } else {
      const dialogConfig = new MatDialogConfig();
      const formCreateProposal = this.formCreateProposal.getRawValue();
  
      dialogConfig.maxWidth = "90vw";
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = 'scrumboard-card-dialog';
      dialogConfig.data = {
        password: 'P@ssw0rd',
        IMPORT_FROM_METHOD: 'CREATE',
        area: this.selectedSalesPoint,
        selected: this.selectedKecamatan,
        formCreateProposal,
      };
  
      this.dialogRef = this.dialog.open(TrsProposalKecamatanComponent, dialogConfig);
  
      this.dialogRef.afterClosed().subscribe(response => {
        // regency = kabupaten
        // district = kecamatan
        var result = [];
        var result_id = [];
        if (typeof response !== "undefined") {
          response.forEach(function (item) {
            result_id.push(item.id);
            result.push(item.regency + " - " + item.district);
          });
  
          this.selectedKecamatan = result_id.join("__");
          this.formCreateProposal.get('kecamatan_selected').setValue(result.join(", "));
  
          console.log(result);
        }
      });
    }
  }

  modalProduct() {
    if (this.selectedArea == ""){
      alert("Tunggu, data Area sedang di load");
    } else {
      const dialogConfig = new MatDialogConfig();
      const formCreateProposal = this.formCreateProposal.getRawValue();
  
      dialogConfig.maxWidth = "90vw";
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = 'scrumboard-card-dialog';
      dialogConfig.data = {
        password: 'P@ssw0rd',
        IMPORT_FROM_METHOD: 'CREATE',
        area: this.selectedArea,
        selected: this.selectedProduct,
        formCreateProposal,
      };
  
      this.dialogRef = this.dialog.open(TrsProposalProductComponent, dialogConfig);
  
      this.dialogRef.afterClosed().subscribe(response => {
        var result = [];
        var result_id = [];
        if (typeof response !== "undefined") {
          response.forEach(function (item) {
            result_id.push(item.id);
            result.push(item.code + " (" + item.name + ")");
          });
  
          this.selectedProduct = result_id.join("__");
          this.formCreateProposal.get('product_selected').setValue(result.join(", "));
  
          console.log(result);
        }
      });
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

  filteringGeotree(areaList) {
    return areaList;
  }

  initFilterArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'area':
          level_desc = 'salespoint';
          this.formCreateProposal.get('area').setValue(item.id);
          this.formCreateProposal.get('area').disable();
          break
        case 'salespoint':
          level_desc = 'district';
          this.formCreateProposal.get('salespoint').setValue(item.id);
          this.formCreateProposal.get('salespoint').disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res;
        });

        this.formCreateProposal.get('salespoint').setValue('');
        break;

      default:
        break;
    }
  }

  createArea(): FormGroup {
    return this.formBuilder.group({
      area: [this.listLevelArea[0]["id"], Validators.required],
      salespoint: [""],
      list_area: this.formBuilder.array(this.listLevelArea),
      list_salespoint: this.formBuilder.array([]),
    })
  }

  addArea() {
    let wilayah = this.formCreateProposal.controls['areas'] as FormArray;
    wilayah.push(this.createArea());
    const index = wilayah.length > 0 ? (wilayah.length - 1) : 0
    this.initArea(index);
    this.generataList('salespoint', this.listLevelArea[0]["id"], index, 'render');
  }

  initArea(index) {
    let wilayah = this.formCreateProposal.controls['areas'] as FormArray;
    this.areaType.map(item => {
      switch (item.type.trim()) {
        case 'area':
          wilayah.at(index).get('area').disable();
          break;
        case 'salespoint':
          wilayah.at(index).get('salespoint').disable();
          break;
      }
    })
  }

  async generataList(selection, id, index, type) {
    this.areaIdNonTargetAudience = id;
    let item: any;
    let response: any;
    let list: any;
    let wilayah = this.formCreateProposal.controls['areas'] as FormArray;
    

    switch (selection) {
      case 'salespoint':
        item = wilayah.at(index).get('list_area').value.length > 0 ? wilayah.at(index).get('list_area').value.filter(item => item.id === id)[0] : {};
      
        response = await this.notificationService.getListOtherChildren({ parent_id: id }).toPromise();
        list = wilayah.at(index).get(`list_${selection}`) as FormArray;

        //clear hasil sebelumnya
        while (list.length > 0) {
          list.removeAt(list.length - 1);
        }

        _.clone(response || []).map(item => {
          list.push(this.formBuilder.group({ ...item, name: item.name }));
        });
        if (list.length > 0){
          list.removeAt(0);
        }

        if (type !== 'render') {
          wilayah.at(index).get('salespoint').setValue('');
        }

        this.selectedArea = id;
        break;

      case 'district':
        this.selectedSalesPoint = id;
        break;
  

      default:
        break;
    }
  }

  clearFormArray = (index, selection) => {
    let wilayah = this.formCreateProposal.controls['areas'] as FormArray;
    let list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
    }
  }

  getToolTipData(value, array) {
    if (value && array.length) {
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return "";
    }
  }

  findDuplicate(array) {
    var object = {};
    var result = [];

    array.forEach(function (item) {
      if (!object[item])
        object[item] = 0;
      object[item] += 1;
    })

    for (var prop in object) {
      if (object[prop] >= 2) {
        result.push(prop);
      }
    }

    return result;
  }

}
