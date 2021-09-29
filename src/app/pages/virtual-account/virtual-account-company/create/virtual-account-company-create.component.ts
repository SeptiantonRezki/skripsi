import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { VirtualAccountCompanyService } from 'app/services/virtual-account/virtual-account-company.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-virtual-account-company-create',
  templateUrl: './virtual-account-company-create.component.html',
  styleUrls: ['./virtual-account-company-create.component.scss']
})
export class VirtualAccountCompanyCreateComponent implements OnInit {
  formCompany: FormGroup;
  listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];
  listBanks: any[] = [];
  listBankMap: any[] = [];

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private virtualAccountCompanyService: VirtualAccountCompanyService,
    private ls: LanguagesService
  ) {

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
    this.getBanks();
  }

  numbersOnlyValidation(event) {
    const inp = String.fromCharCode(event.keyCode);
    /*Allow only numbers*/
    if (!/^\d+$/.test(inp)) {
      event.preventDefault()
    }
  }

  getBanks() {
    this.virtualAccountCompanyService.bankList({}).subscribe(res => {
      this.listBanks = res.data;
      this.listBanks.forEach(bank => {
        this.listBankMap[bank.code] = bank.name;
      });
    }, err=> {
      
    })
  }

  submit() {
    if (this.formCompany.valid) {
      this.dataService.showLoading(true);
      let body = {
        code_bank: this.formCompany.get('name').value,
        name: this.listBankMap[this.formCompany.get('name').value],
        contact: '+62' + this.formCompany.get('contact').value,
        email: this.formCompany.get('email').value,
        flowingly_id: this.formCompany.get('flowingly_id').value,
        status: this.formCompany.get('status').value,
        // minimum_transaction: this.formCompany.get('minimum_transaction').value,
        service_cost: this.formCompany.get('service_cost').value,
      }
      console.log(body)

      this.virtualAccountCompanyService.create(body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        })
        this.router.navigate(['virtual-account', 'companies']);
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
