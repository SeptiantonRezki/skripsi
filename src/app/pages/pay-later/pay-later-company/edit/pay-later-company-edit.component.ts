import { Component, OnInit } from '@angular/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PayLaterCompanyService } from 'app/services/pay-later/pay-later-company.service';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-pay-later-company-edit',
  templateUrl: './pay-later-company-edit.component.html',
  styleUrls: ['./pay-later-company-edit.component.scss']
})
export class PayLaterCompanyEditComponent implements OnInit {
  formCompany: FormGroup;
  listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];
  shortDetail: any;
  detailCompany: any;
  isDetail: Boolean;
  companies: Array<any> = [];
  dataType: any;

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private paylaterCompanyService: PayLaterCompanyService,
    private activatedRoute: ActivatedRoute,
    private ls: LanguagesService
  ) {
    this.shortDetail = this.dataService.getFromStorage('detail_paylater_company');
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  ngOnInit() {
    this.dataType = this.router.routerState.root.queryParams['value'].type;
    
    this.formCompany = this.formBuilder.group({
      name: ["", Validators.required],
      contact_number: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      flowingly_id: ["", Validators.required],
      paylater_group_id: ["", Validators.required],
      status: ["", Validators.required],
      minimum_transaction: [0, Validators.required],
      status_product_src: ["", Validators.required],
    });

    let regex = new RegExp(/[0-9]/g);
    this.formCompany.get('contact_number').valueChanges.subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.formCompany.get('contact_number').setValue(phone, { emitEvent: false });
        }
      }
    })
    this.paylaterCompanyService.list({}).subscribe(res => { this.companies = res.data });

    this.getDetail();

  }

  getDetail() {
    this.dataService.showLoading(true);
    this.paylaterCompanyService.show({ company_id: this.shortDetail.id }, {paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      this.detailCompany = res.data;

      this.formCompany.setValue({
        name: res.data.name,
        email: res.data.email,
        contact_number: res.data.contact_number ? (res.data.contact_number.split("+62")[1] ? res.data.contact_number.split("+62")[1] : res.data.contact_number) : '',
        flowingly_id: res.data.flowingly_id,
        status: res.data.status,
        minimum_transaction: res.data.min_transaction ? res.data.min_transaction : 0,
        paylater_group_id: res.data.paylater_group_id,
        status_product_src: (res.data.status_product_src) ? res.data.status_product_src : 'inactive',
      });
      if (this.isDetail) {
        this.formCompany.disable();
      }
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  numbersOnlyValidation(event) {
    const inp = String.fromCharCode(event.keyCode);
    /*Allow only numbers*/
    if (!/^\d+$/.test(inp)) {
      event.preventDefault()
    }
  }

  submit() {
    if (this.formCompany.valid) {
      this.dataService.showLoading(true);
      let body = {
        name: this.formCompany.get('name').value,
        contact_number: '+62' + this.formCompany.get('contact_number').value,
        email: this.formCompany.get('email').value,
        flowingly_id: this.formCompany.get('flowingly_id').value,
        status: this.formCompany.get('status').value,
        min_transaction: this.formCompany.get('minimum_transaction').value,
        paylater_group_id: this.formCompany.get('paylater_group_id').value,
        status_product_src: this.formCompany.get('status_product_src').value
      }

      this.paylaterCompanyService.put(body, { company_id: this.detailCompany.id }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        })
        this.router.navigate(['paylater', 'companies'], {queryParams:{type: this.dataType}});
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      })
      commonFormValidator.validateAllFields(this.formCompany);
    }
  }

}
