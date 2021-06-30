import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  OnChanges,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from '../../../services/data.service';
import { Subject, Observable, ReplaySubject, Subscription } from "rxjs";
import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import * as _ from "underscore";
import { environment } from "environments/environment";
import { IdbService } from "app/services/idb.service";
import {KPSModel} from 'app/pages/kpi-setting/kpi-setting.model';
import { commonFormValidator } from "app/classes/commonFormValidator";
import * as moment from 'moment';
import { DialogService } from "app/services/dialog.service";
import { MasterKPIService } from '../../../services/kpi-setting/master-kpi.service';
import { KPISettingService } from "app/services/kpi-setting/kpi-setting.service";

@Component({
  selector: 'app-edit-kpi-setting.component',
  templateUrl: './edit-kpi-setting.component.html',
  styleUrls: ['./edit-kpi-setting.component.scss']
})
export class EditKPISettingComponent implements OnInit {
  formKPI: FormGroup;
  formdataErrors: any;
  paramEdit: any = null;

  indexDelete: any;

  private subscription: Subscription;
  KPS: KPSModel;

  loadingIndicator: Boolean;
  saveData: Boolean;

  categories = [
    'visit', 'brand', 'trade program', 'ecosystem'
  ];

  brands: Array<any>;
  brand_parameters: Array<any>;
  trade_program_objectives: Array<any>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private kpiSettingService: KPISettingService,
    private masterKPIService: MasterKPIService,
    private route: ActivatedRoute,
  ) {

    this.formdataErrors = {
      category: {}
    };
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe((params) => {
      if (params['id']) {
        this.paramEdit = params['id'];
      }
    });

    this.masterKPIService.getBrands().subscribe((res) => {
      this.brands = res
      console.log(res)
    })

    this.masterKPIService.getBrandParameters().subscribe((res) => {
      this.brand_parameters = res
      console.log(res)
    })
    this.masterKPIService.getTradeProgramObjectives().subscribe((res) =>{
      this.trade_program_objectives = res
      console.log(res)
    })

    this.formKPI = this.formBuilder.group({
      year: [''],
      kps_number: ['this.KPS.kps_number'],
      date: [''],
      kpis: this.formBuilder.array([], Validators.required)
    });

    this.formKPI.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formKPI, this.formdataErrors);
    })

    this.formKPI.get('year').disable();
    this.formKPI.get('kps_number').disable();
    this.formKPI.get('date').disable();

    console.log('paramEdit', this.paramEdit);
    this.kpiSettingService.getById(this.paramEdit).subscribe(res => {
      this.KPS = res;
      // this.KPS =  this.dataService.getFromStorage('kps');
      console.log(this.KPS);
      this.setDetail();
    });
  }

  setDetail() {
    this.formKPI.controls['year'].setValue(this.KPS.year);
    this.formKPI.controls['kps_number'].setValue(this.KPS.kps_number);

    let startDate = moment(this.KPS.start_date).format('DD MMM YYYY');
    let endDate = moment(this.KPS.end_date).format('DD MMM YYYY');
    let dateStr = `${startDate} - ${endDate}`;

    this.formKPI.controls['date'].setValue(dateStr);

    let kpis = this.formKPI.controls['kpis'] as FormArray;
    for(let kpi_setting of this.KPS.kpi_settings){
      let brandRequired = kpi_setting.category == 'brand' || kpi_setting.category == 'trade_program';
      let parameterRequired = kpi_setting.category == 'brand' || kpi_setting.category == 'trade_program';
      kpis.push(this.formBuilder.group({
        category: [kpi_setting.category, Validators.required],
        brand: [kpi_setting.brand_id, ...(brandRequired && [Validators.required])],
        parameter: [kpi_setting.parameter_id, ...(parameterRequired && [Validators.required])]
      }))
    }
  }

  addKPI() {
    let kpis = this.formKPI.controls['kpis'] as FormArray;
    kpis.push(this.createKPI());
  }

  createKPI(): FormGroup {
    return this.formBuilder.group({
      category: ['', Validators.required],
      brand: [''],
      parameter: ['']
    })
  }

  deleteKPI(pos) {
    let dialogData = {
      titleDialog: 'Hapus KPI',
      captionDialog: `Apa Anda yakin menghapus KPI ${pos+1}?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ['Hapus', 'Batal']
    }
    this.dialogService.openCustomConfirmationDialog(dialogData);
  }

  confirmDelete() {
    let kpis = this.formKPI.controls.kpis as FormArray;
    kpis.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  resetKPIDetail(pos) {
    console.log(pos);
    let kpis = this.formKPI.controls.kpis as FormArray;
    let kpi = kpis.at(pos);
    console.log(kpi);
    
    let category = kpi.get('category').value
    console.log(category);
    kpi.get('brand').setValue('');
    kpi.get('parameter').setValue('');

    let brandRequired = category == 'brand' || category == 'trade_program';
    let parameterRequired = category == 'brand' || category == 'trade_program';
    console.log('brandRequired', brandRequired);
    console.log('parameterRequired', parameterRequired);
    if(brandRequired) {
      kpi.get('brand').setValidators([Validators.required]);
    } else {
      kpi.get('brand').setValidators(null);
    }
    if(parameterRequired) {
      kpi.get('parameter').setValidators([Validators.required]);
    } else {
      kpi.get('parameter').setValidators(null);
    }
    this.formKPI.updateValueAndValidity();
    this.formKPI.updateValueAndValidity();
  }

  submit() {
    console.log(this.formKPI.get('kpis'))
    
    if(this.formKPI.valid) {
      let kpis = this.formKPI.controls.kpis as FormArray;
      let kpi_settings = kpis.value.map(kpi => {
        return {
          category: kpi.category,
          ...(kpi.brand && {brand_id: kpi.brand}),
          ...(kpi.parameter && {parameter_id: kpi.parameter}),
        };
      })
      let body = {
        id: this.paramEdit,
        kpi_settings
      };
      console.log(body);
      this.kpiSettingService.put(body).subscribe(res => {
        if(res.status == 'success') {
          this.dialogService.openSnackBar({ message: "Data Berhasil Diubah" });
          this.router.navigate(["kpisetting", "kps-list"]);
          window.localStorage.removeItem("kps");
        }
      });
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formKPI);
    }
  }
}
