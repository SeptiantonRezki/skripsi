import { Component, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DialogService } from '../../../../services/dialog.service';
import { TradeProgramService } from '../../../../services/dte/trade-program.service';
import { Router } from '@angular/router';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { DateAdapter } from '@angular/material';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-trade-create',
  templateUrl: './trade-create.component.html',
  styleUrls: ['./trade-create.component.scss']
})
export class TradeCreateComponent {
  formTradeProgram: FormGroup;
  formTradeProgramError: any;

  minDateFrom: any;
  minDate: any;
  minExpireDate: any;

  files: File;
  validComboDrag: boolean;
  valueChange: Boolean;
  saveData: Boolean;
  statusTP: any[] = [{ name: 'Terbitkan', value: 'publish' }, { name: 'Tidak Diterbitkan', value: 'unpublish' }]

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.valueChange && !this.saveData) {
      return false;
    }

    if (this.files) {
      return false;
    }

    return true;
  }
  
  constructor(
    private router: Router,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private tradeProgramService: TradeProgramService
  ) { 
    this.adapter.setLocale('id');
    this.minDateFrom = moment();
    this.minDate = moment();
    this.minExpireDate = moment();
    this.saveData = false;
    
    this.formTradeProgramError = {
      name: {},
      start_date: {},
      end_date: {},
      budget: {},
      coin_expiry_date: {}
    }
  }

  ngOnInit() {
    this.formTradeProgram = this.formBuilder.group({
      name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(0)]],
      coin_expiry_date: ['', Validators.required],
      status: ['publish', Validators.required]
    })

    this.formTradeProgram.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTradeProgram, this.formTradeProgramError);
    })

    this.formTradeProgram.valueChanges.subscribe(res => {
      this.valueChange = true;
    })
  }

  setMinEndDate() {
    this.formTradeProgram.get("end_date").setValue("");
    this.minDate = this.formTradeProgram.get("start_date").value;
  }

  setMinExpireDate() {
    this.formTradeProgram.get("coin_expiry_date").setValue("");
    this.minExpireDate = this.formTradeProgram.get("end_date").value;
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.files && this.files.size > 2000000) return this.dialogService.openSnackBar({ message: 'Ukuran gambar maksimal 2mb!' })

    if (this.formTradeProgram.valid) {
      this.saveData = !this.saveData;
      let fd = new FormData();

      let body = {
        name: this.formTradeProgram.get('name').value,
        start_date: this.convertDate(this.formTradeProgram.get('start_date').value),
        end_date: this.convertDate(this.formTradeProgram.get('end_date').value),
        budget: this.formTradeProgram.get('budget').value,
        coin_expiry_date: this.convertDate(this.formTradeProgram.get('coin_expiry_date').value),
        status: this.formTradeProgram.get('status').value,
      }

      fd.append('name', body.name);
      fd.append('start_date', body.start_date);
      fd.append('end_date', body.end_date);
      fd.append('budget', body.budget);
      fd.append('coin_expiry_date', body.coin_expiry_date);
      fd.append('status', body.status);
      if (this.files) fd.append('image', this.files);
  
      this.tradeProgramService.create(fd).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan' });
          this.router.navigate(['dte', 'trade-program']);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });
      commonFormValidator.validateAllFields(this.formTradeProgram);
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }
}
