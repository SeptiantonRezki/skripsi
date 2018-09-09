import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';

@Component({
  selector: 'app-audience-edit',
  templateUrl: './audience-edit.component.html',
  styleUrls: ['./audience-edit.component.scss']
})
export class AudienceEditComponent {

  formAudience: FormGroup;
  formAudienceError: any;
  detailAudience: any;
  detailAudienceSelected: any;

  listScheduler: Array<any>;
  rows: any[];
  listType: any[] = [{ name: 'Batasi Audience', value: 'limit'}, { name: 'Pilih Semua', value: 'pick-all' }];

  selected = [];
  area: Array<any>;
  queries: any;

  searchRetailer = new Subject<string>();

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
    this.detailAudience = dataService.getFromStorage('detail_audience');
  }

  ngOnInit() {
    this.formAudience = this.formBuilder.group({
      name: ["", Validators.required],
      min: ["", Validators.required],
      max: ["", Validators.required],
      type: [""],
      national: [""],
      division: [""],
      region: [""],
      area: [""],
      district: [""],
      teritory: [""],
      trade_scheduler_id: ["", Validators.required],
    })

    this.initAudience();
    this.initArea();

    this.formAudience.valueChanges.subscribe(res => {
      if (res.type === 'pick-all') {
        this.formAudience.get('min').disable({emitEvent: false});
        this.formAudience.get('max').disable({emitEvent: false});
      } else {
        this.formAudience.get('min').enable({emitEvent: false});
        this.formAudience.get('max').enable({emitEvent: false});
      }
    })
  }

  initAudience() {
    this.formAudience.get('name').setValue(this.detailAudience.name);
    this.formAudience.get('min').setValue(this.detailAudience.min);
    this.formAudience.get('max').setValue(this.detailAudience.max);
    this.formAudience.get('type').setValue(this.detailAudience.max && this.detailAudience.min ? 'limit' : 'pick-all');
    this.formAudience.get('trade_scheduler_id').setValue(this.detailAudience.trade_scheduler_id);

    // for (const item of this.detailAudience['retailer_id']) {
    //   for (const value of this.rows) {
    //     if (item === value.id) {
    //       this.selected.push(value);
    //     }
    //   }
    // }

    if (!this.detailAudience.min) {
      this.formAudience.get('min').disable();
    }

    if (!this.detailAudience.max) {
      this.formAudience.get('max').disable();
    }

    this.detailAudienceSelect();
  }

  detailAudienceSelect() {
    this.audienceService.getListRetailerSelected({ audience_id: this.detailAudience.id }).subscribe(
      res => {
        for (const item of res.data) {
          for (const value of this.rows) {
            if (item.id === value.id) {
              this.selected.push(value);
            }
          }
        }
      }
    )
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
          _method: 'PUT',
          name: this.formAudience.get('name').value,
          trade_scheduler_id: this.formAudience.get('trade_scheduler_id').value,
          min: limit ? this.formAudience.get('min').value : '',
          max: limit ? this.formAudience.get('max').value : '',
          retailer_id: this.selected.map(item => item.id)
        }

        this.audienceService.put(body, {audience_id: this.detailAudience.id}).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: 'Data Berhasil Diubah'})
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
