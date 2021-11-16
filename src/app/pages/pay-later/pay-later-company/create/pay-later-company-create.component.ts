import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { PayLaterCompanyService } from 'app/services/pay-later/pay-later-company.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-pay-later-company-create',
  templateUrl: './pay-later-company-create.component.html',
  styleUrls: ['./pay-later-company-create.component.scss']
})
export class PayLaterCompanyCreateComponent implements OnInit {
  formCompany: FormGroup;
  listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];
  companies: Array<any> = [];

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private paylaterCompanyService: PayLaterCompanyService,
    private ls: LanguagesService
  ) {

  }

  ngOnInit() {
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

    this.paylaterCompanyService.list({}).subscribe(res => {
      this.companies = res.data
    }, err=> {

    })

    let regex = new RegExp(/[0-9]/g);
    this.formCompany.get('contact_number').valueChanges.subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.formCompany.get('contact_number').setValue(phone, { emitEvent: false });
        }
      }
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
        paylater_group_id: this.formCompany.get('paylater_group_id').value,
        status: this.formCompany.get('status').value,
        min_transaction: this.formCompany.get('minimum_transaction').value,
        status_product_src: this.formCompany.get('status_product_src').value
      }

      this.paylaterCompanyService.create(body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        })
        this.router.navigate(['paylater', 'companies']);
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
