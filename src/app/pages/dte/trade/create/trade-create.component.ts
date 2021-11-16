import { Component, OnInit, HostListener } from '@angular/core';
import moment from 'moment';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { DialogService } from '../../../../services/dialog.service';
import { TradeProgramService } from '../../../../services/dte/trade-program.service';
import { Router } from '@angular/router';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { DateAdapter } from '@angular/material';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { takeUntil } from 'rxjs/operators';
import { LanguagesService } from 'app/services/languages/languages.service';

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

  private _onDestroy = new Subject<void>();
  filteredGTpOptions: Observable<string[]>;
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.valueChange && !this.saveData) {
      return false;
    }

    if (this.files && !this.saveData) {
      console.log('deactivate you have file');
      return false;
    }

    return true;
  }

  listGroupTradeProgram: any[] = [];

  constructor(
    private router: Router,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private tradeProgramService: TradeProgramService,
    private groupTradeProgramService: GroupTradeProgramService,
    private ls: LanguagesService
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
    this.getGroupTradeProgram();
    this.formTradeProgram = this.formBuilder.group({
      name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(0)]],
      coin_expiry_date: ['', Validators.required],
      status: ['publish', Validators.required],
      group_trade_program: [""]
    })

    this.formTradeProgram.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTradeProgram, this.formTradeProgramError);
    })

    this.formTradeProgram.valueChanges.subscribe(res => {
      this.valueChange = true;
    })

    this.filterGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTP();
      });
    
    setTimeout(() => {
      document.getElementById("trade-create").getElementsByTagName("input")[0].id = "upload-file-trade";
    }, 500);
  }

  selectStatusTrade(){
    const matOption = document.querySelectorAll('mat-option');
    for (let index = 0; index < this.statusTP.length; index++) {
      matOption[index].querySelector('span').id = "options";
    }
  }

  filteringGTP() {
    if (!this.listGroupTradeProgram) {
      return;
    }
    // get the search keyword
    let search = this.filterGTP.value;
    if (!search) {
      this.filteredGTP.next(this.listGroupTradeProgram.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredGTP.next(
      this.listGroupTradeProgram.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getGroupTradeProgram() {
    this.groupTradeProgramService.get({ page: 'all' }).subscribe(res => {
      this.listGroupTradeProgram = res.data ? res.data.data : [];
      this.filteredGTP.next(this.listGroupTradeProgram.slice());
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
      fd.append('trade_creator_group_id', this.formTradeProgram.get('group_trade_program').value);
      if (this.files) fd.append('image', this.files);

      this.tradeProgramService.create(fd).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
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
