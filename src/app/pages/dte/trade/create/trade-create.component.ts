import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DialogService } from '../../../../services/dialog.service';
import { TradeProgramService } from '../../../../services/dte/trade-program.service';
import { Router } from '@angular/router';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-trade-create',
  templateUrl: './trade-create.component.html',
  styleUrls: ['./trade-create.component.scss']
})
export class TradeCreateComponent {
  formTradeProgram: FormGroup;
  formTradeProgramError: any;

  minDate: Date;
  minExpireDate: Date;
  
  constructor(
    private router: Router,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private tradeProgramService: TradeProgramService
  ) { 
    this.adapter.setLocale('id');
    
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
      budget: ['', Validators.required],
      coin_expiry_date: ['', Validators.required]
    })

    this.formTradeProgram.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTradeProgram, this.formTradeProgramError);
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

  submit(): void {
    if (this.formTradeProgram.valid) {
      let body = {
        name: this.formTradeProgram.get('name').value,
        start_date: this.convertDate(this.formTradeProgram.get('start_date').value),
        end_date: this.convertDate(this.formTradeProgram.get('end_date').value),
        budget: this.formTradeProgram.get('budget').value,
        coin_expiry_date: this.convertDate(this.formTradeProgram.get('coin_expiry_date').value)
      }

      this.tradeProgramService.create(body).subscribe(
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
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }
}
