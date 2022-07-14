import { Component, OnInit } from '@angular/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { VirtualAccountCompanyService } from 'app/services/virtual-account/virtual-account-company.service';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LanguagesService } from 'app/services/languages/languages.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-virtual-account-company-edit',
  templateUrl: './virtual-account-company-edit.component.html',
  styleUrls: ['./virtual-account-company-edit.component.scss']
})
export class VirtualAccountCompanyEditComponent implements OnInit {
  formCompany: FormGroup;
  listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];
  shortDetail: any;
  detailCompany: any;
  isDetail: Boolean;
  listBanks: any[] = [];
  listBankMap: any[] = [];
  startDateValue: any;
  endDateValue: any;
  minEndDate: any;

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private virtualAccountCompanyService: VirtualAccountCompanyService,
    private activatedRoute: ActivatedRoute,
    private ls: LanguagesService
  ) {
    this.shortDetail = this.dataService.getFromStorage('detail_virtual_account_company');
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  ngOnInit() {
    this.formCompany = this.formBuilder.group({
      name: ["", Validators.required],
      contact: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      flowingly_id: ["", Validators.required],
      status: ["", Validators.required],
      // minimum_transaction: [0, Validators.required],
      service_cost: [0, Validators.required]
    });

    let regex = new RegExp(/[0-9]/g);
    this.formCompany.get('contact').valueChanges.subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.formCompany.get('contact').setValue(phone, { emitEvent: false });
        }
      }
    })

    this.getDetail();
    this.getBanks();
  }

  getDetail() {
    this.dataService.showLoading(true);
    this.virtualAccountCompanyService.show({ company_id: this.shortDetail.id }).subscribe(res => {
      this.detailCompany = res;

      this.formCompany.setValue({
        name: res.code_bank,
        email: res.email,
        contact: res.contact ? (res.contact.split("+62")[1] ? res.contact.split("+62")[1] : res.contact) : '',
        flowingly_id: res.flowingly_id,
        status: res.status,
        // minimum_transaction: res.minimum_transaction ? res.minimum_transaction : 0,
        service_cost: res.service_cost
      });
      if (this.isDetail) {
        this.formCompany.disable();
      }
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  getBanks() {
    this.virtualAccountCompanyService.bankList({}).subscribe(res => {
      this.listBanks = res.data;
      this.listBanks.forEach(bank => {
        this.listBankMap[bank.code] = bank.name;
      });
    }, err => {

    })
  }

  numbersOnlyValidation(event) {
    const inp = String.fromCharCode(event.keyCode);
    /*Allow only numbers*/
    if (!/^\d+$/.test(inp)) {
      event.preventDefault()
    }
  }

  onDateChange(typeDate, date) {
    this[typeDate] = date.target.value;
    if (typeDate == 'startDateValue' && date.target.value) {
      this.minEndDate = date.target.value.toDate();
    }
    if (typeDate == 'startDateValue' && (date.target.value == null)) {
      this.minEndDate = null;
    }
    // console.log("date event", typeDate, ":", date.target.value ? date.target.value.format('YYYY-MM-DD') : null);
  }

  async download() {
    this.dataService.showLoading(true);
    let fileName = `Report_BRIVA_${this.startDateValue ? this.startDateValue.format('YYYYMMDD') : ''}to${this.endDateValue ? this.endDateValue.format('YYYY-MM-DD') : ''}.xlsx`;
    // console.log(fileName);
    try {
      const response = await this.virtualAccountCompanyService.exportExcel({start_date: this.startDateValue ? this.startDateValue.format('YYYY-MM-DD') : null, end_date: this.endDateValue ? this.endDateValue.format('YYYY-MM-DD') : null }).toPromise();
      // console.log('he', response.headers);
      if (response.type == "application/json") {
        throw response.errDesc || 'Terjadi kesalahan, silakan ulangi lagi';
      }
      // if (typeof response == `object` && (response.errDesc || response.status == false)) {
      //   throw response.errDesc || 'Terjadi kesalahan, silakan ulangi lagi';
      // }
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  handleError(error) {
    // console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

  submit() {
    if (this.formCompany.valid) {
      this.dataService.showLoading(true);
      const body = {
        code_bank: this.formCompany.get('name').value,
        name: this.listBankMap[this.formCompany.get('name').value],
        contact: '+62' + this.formCompany.get('contact').value,
        email: this.formCompany.get('email').value,
        flowingly_id: this.formCompany.get('flowingly_id').value,
        status: this.formCompany.get('status').value,
        // minimum_transaction: this.formCompany.get('minimum_transaction').value,
        service_cost: this.formCompany.get('service_cost').value,
      };
      this.virtualAccountCompanyService.put(body, { company_id: this.detailCompany.id }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.router.navigate(['virtual-account', 'companies']);
      }, err => {
        this.dataService.showLoading(false);
      });
    } else {
      this.dialogService.openSnackBar({
        message: this.ls.locale.global.messages.text7
      });
      commonFormValidator.validateAllFields(this.formCompany);
    }
  }

}
