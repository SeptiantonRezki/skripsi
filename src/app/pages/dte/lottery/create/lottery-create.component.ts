import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'app/classes/config';
import { LanguagesService } from 'app/services/languages/languages.service';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { LotteryService } from "app/services/dte/lottery.service";
import { DialogService } from 'app/services/dialog.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lottery-create',
  templateUrl: './lottery-create.component.html',
  styleUrls: ['./lottery-create.component.scss']
})
export class LotteryCreateComponent implements OnInit {
  selectedTab: number = 0;

  formUndian: FormGroup;
  // formAudience: FormGroup;
  // formPreview: FormGroup;
  onLoad: boolean;
  minDateStart = new Date();
  minDateEnd = new Date();
  minDateAnnounce = new Date();
  groupTradePrograms: any[] = [];

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;
  imageConverted: any;
  preview_header: FormControl = new FormControl("");

  statusTP: any[] = [{ name: this.translate.instant('dte.trade_program.text6'), value: 'publish' }, { name: this.translate.instant('dte.trade_program.text7'), value: 'unpublish' }]

  listGroupTradeProgram: any[] = [];
  listSubGroupTradeProgram: any[] = [];

  private _onDestroy = new Subject<void>();
  filteredGTpOptions: Observable<string[]>;
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterSGTP: FormControl = new FormControl();
  public filteredSGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public options: Object = { ...Config.FROALA_CONFIG, placeholderText: "" };


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
    private groupTradeProgramService: GroupTradeProgramService,
    private lotteryService: LotteryService,
    private dialogService: DialogService,
  ) {
    this.onLoad = true
  }

  ngOnInit() {
    this.formUndian = this.formBuilder.group({
      name: ["", Validators.required],
      coin: ["", Validators.required],
      group_trade_program: [""],
      sub_group_trade_program: [""],
      start_date: [new Date()],
      start_time: ["00:00", Validators.required],
      end_date: [new Date()],
      end_time: ["00:00", Validators.required],
      announcement_date:  [new Date()],
      announcement_time: ["00:00", Validators.required],
    })
    
    this.filterGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTP();
      });

    this.filterSGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringSGTP();
      });

    this.getGroupTradeProgram();
    this.getSubGroupTradeProgram();

    this.onLoad = false;
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

  getSubGroupTradeProgram() {
    this.groupTradeProgramService.getSubGroupTrade({ page: 'all' }).subscribe(res => {
      const data = res.data ? res.data.data.filter((item: any) => item.status === "active") : [];
      this.listSubGroupTradeProgram = data;
      this.filteredSGTP.next(this.listSubGroupTradeProgram.slice());
    })
  }
  
  filteringSGTP() {
    if (!this.listSubGroupTradeProgram) {
      return;
    }
    // get the search keyword
    let search = this.filterSGTP.value;
    if (!search) {
      this.filteredSGTP.next(this.listSubGroupTradeProgram.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredSGTP.next(
      this.listSubGroupTradeProgram.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  removeImage(): void {
    this.files = undefined;
    this.imageConverted = undefined;
  }

  changeImage(event) {
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageConverted = myReader.result;
    }

    myReader.readAsDataURL(file);
  }

  submit(): void {

    if (this.formUndian.valid) {
      let fd = new FormData();

      let body = {
        name: this.formUndian.get('name').value,
        coin: this.formUndian.get('coin').value,
        // start_date: this.convertDate(this.formUndian.get('start_date').value),
        // end_date: this.convertDate(this.formUndian.get('end_date').value),
        // announcement_date: this.convertDate(this.formUndian.get('announcement_date').value),
        start_date: `${moment(this.formUndian.get('start_date').value).format('YYYY-MM-DD')} ${this.formUndian.get('start_time').value}:00`,
        end_date: `${moment(this.formUndian.get('end_date').value).format('YYYY-MM-DD')} ${this.formUndian.get('end_time').value}:00`,
        announcement_date: `${moment(this.formUndian.get('announcement_date').value).format('YYYY-MM-DD')} ${this.formUndian.get('announcement_time').value}:00`,
      }

      fd.append('name', body.name);
      fd.append('coin', body.coin);
      fd.append('start_date', body.start_date);
      fd.append('end_date', body.end_date);
      fd.append('announcement_date', body.announcement_date);
      // fd.append('trade_creator_group_id[]', this.formUndian.get('group_trade_program').value);
      fd.append('trade_creator_group_id[]', '0');
      fd.append('trade_creator_sub_group_id[]', this.formUndian.get('sub_group_trade_program').value);

      this.lotteryService.create(fd).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.router.navigate(['dte', 'lottery']);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
      commonFormValidator.validateAllFields(this.formUndian);
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

  onDateStart($event) {
    const stringified = JSON.stringify($event.value);
    const dob = stringified.substring(1, 11);
    let date = new Date();
    date.setDate(new Date(dob).getDate() + 1);
    console.log(date);
    this.minDateStart = date;
  }
  onDateEnd($event) {
    const stringified = JSON.stringify($event.value);
    const dob = stringified.substring(1, 11);
    let date = new Date();
    date.setDate(new Date(dob).getDate() + 1);
    console.log(date);
  }
  onDateAnnounce($event) {
    const stringified = JSON.stringify($event.value);
    const dob = stringified.substring(1, 11);
    let date = new Date();
    date.setDate(new Date(dob).getDate() + 1);
    console.log(date);
  }

}
