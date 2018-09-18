import { Component, OnInit, HostListener } from '@angular/core';
import { formatCurrency } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../services/data.service';
import { AudienceService } from '../../../../services/dte/audience.service';
import { DialogService } from '../../../../services/dialog.service';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-audience-create',
  templateUrl: './audience-create.component.html',
  styleUrls: ['./audience-create.component.scss']
})
export class AudienceCreateComponent {
  formAudience: FormGroup;
  formAudienceError: any;

  listScheduler: Array<any>;
  rows: any[];
  listType: any[] = [{ name: 'Batasi Audience', value: 'limit'}, { name: 'Pilih Semua', value: 'pick-all' }];

  selected = [];
  area: Array<any>;
  queries: any;

  searchRetailer = new Subject<string>();

  valueChange: Boolean;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.valueChange)
      return false;

    if (this.selected.length > 0)
      return false;

    return true;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private audienceService: AudienceService
  ) { 
    this.formAudienceError = {
      name: {},
      min: {},
      max: {},
      trade_scheduler_id: {}
    }

    this.searchRetailer.debounceTime(500)
    .flatMap(search => {
      return Observable.of(search).delay(500);
    })
    .subscribe(res => {
      this.searchingRetailer();
    })

    this.listScheduler = activatedRoute.snapshot.data['listScheduler'].data.filter(item => item.audience === null);
    this.rows = activatedRoute.snapshot.data['listRetailer'];

    // this.onSelect();
    this.area = dataService.getFromStorage('profile')['area_type'];
  }

  ngOnInit() {
    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      min: ["", Validators.required],
      max: ["", Validators.required],
      type: ["limit"],
      national: [""],
      division: [""],
      region: [""],
      area: [""],
      district: [""],
      teritory: [""],
      trade_scheduler_id: ["", Validators.required],
    })

    this.initArea()

    this.formAudience.valueChanges.subscribe(res => {
      if (res.type === 'pick-all') {
        this.formAudience.get('min').disable({emitEvent: false});
        this.formAudience.get('max').disable({emitEvent: false});
      } else {
        this.formAudience.get('min').enable({emitEvent: false});
        this.formAudience.get('max').enable({emitEvent: false});
      }
    })

    this.formAudience.valueChanges.subscribe(() => {
      this.valueChange = true;
    })
  }

  initArea() {
    let national = this.area.filter(item => { return item.type === 'national' });
    let division = this.area.filter(item => item.type === 'division');
    let region = this.area.filter(item => item.type === 'region');
    let area = this.area.filter(item => item.type === 'area');

    if (national.length > 0) {
      this.formAudience.get('national').setValue(national[0].code.trim());
      this.formAudience.get('national').disable();
    }

    if (division.length > 0) { 
      this.formAudience.get('division').setValue(division[0].code.trim(), {disable: true});
      this.formAudience.get('division').disable();
    }
    if (region.length > 0) {
      this.formAudience.get('region').setValue(region[0].code.trim(), {disable: true});
      this.formAudience.get('region').disable();
    }

    if (area.length > 0) {
      this.formAudience.get('area').setValue(area[0].code.trim(), {disable: true});
      this.formAudience.get('area').disable();
    }
  }

  searchingRetailer() {
    this.queries = {
      national: this.formAudience.get('national').value,
      division: this.formAudience.get('division').value,
      region: this.formAudience.get('region').value,
      area: this.formAudience.get('area').value,
      district: this.formAudience.get('district').value,
      teritory: this.formAudience.get('teritory').value,
    }

    this.audienceService.getListRetailer(this.queries).subscribe(
      res => {
        this.rows = res;
        this.selected = []
      },
      err => {
        console.log(err.error.message)
      }
    )
  }

  changeValue() {
    if (this.formAudience.get('type').value === 'pick-all') {
      this.selected = this.rows;
    } else {
      this.selected = []
    }

  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  submit() {
    if (this.formAudience.valid && this.selected.length > 0) {
      const selectedRetailer = this.selected.length;
      const limit = this.formAudience.get('type').value === 'limit';
      const min = this.formAudience.get('min').value;
      const max = this.formAudience.get('max').value;

      if (limit && selectedRetailer < min) 
        return this.dialogService.openSnackBar({ message: `Jumlah Audience yang dipilih kurang dari ${min} Audience` });
      else if (limit && selectedRetailer > max) 
        return this.dialogService.openSnackBar({ message: `Jumlah Audience yang dipilih melebih dari ${max} Audience` });
      
      let budget = {
        total_retailer: this.selected.length,
        trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value
      }

      this.audienceService.validateBudget(budget).subscribe(res => {
        if (res.selisih < 0) 
          return this.dialogService.openSnackBar({ message: `Jumlah Dana Permintaan melebihi dari Jumlah Dana Trade Program, Selisih Dana : ${res.selisih}!`})
        
        let body = {
          name: this.formAudience.get('name').value,
          trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value,
          min: limit ? this.formAudience.get('min').value : '',
          max: limit ? this.formAudience.get('max').value : '',
          retailer_id: this.selected.map(item => item.id)
        }

        this.audienceService.create(body).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan'})
            this.router.navigate(['dte', 'audience']);
          },
          err => {
            this.dialogService.openSnackBar({ message: err.error.message })
            console.log(err.error.message);
          }
        )
      })
    } else {
      if (this.formAudience.valid && this.selected.length < 0) {
        return this.dialogService.openCustomDialog({ message: 'Belum ada Audience yang dipilih!' });
      }
      
      return this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' })
    }
  }

}
