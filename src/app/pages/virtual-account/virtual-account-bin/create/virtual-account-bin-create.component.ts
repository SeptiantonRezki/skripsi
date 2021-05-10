import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { VirtualAccountBinService } from 'app/services/virtual-account/virtual-account-bin.service';
import { VirtualAccountCompanyService } from 'app/services/virtual-account/virtual-account-company.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-virtual-account-bin-create',
  templateUrl: './virtual-account-bin-create.component.html',
  styleUrls: ['./virtual-account-bin-create.component.scss']
})
export class VirtualAccountBinCreateComponent implements OnInit {
  formBin: FormGroup;
  // listCompany: Array<any> = [{ name: 'Bank Permata', id: '1' }];
  listCompany: Array<any>;
  listBank: Array<any>;
  listBankMap: any = {};

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private VirtualAccountBinService: VirtualAccountBinService,
    private VirtualAccountCompanyService: VirtualAccountCompanyService
  ) {

  }

  getBanks() {
    this.VirtualAccountCompanyService.bankList({}).subscribe(res => {
      this.listBank = res.data;
      this.listBank.forEach(bank => {
        this.listBankMap[bank.code] = bank.name;
      });
      console.log(res.data);
    }, err=> {

    })
  }

  getCompanies() {
    this.VirtualAccountBinService.list({}).subscribe(res => {
      this.listCompany = res.data.data
      console.log(res.data.data)
    }, err=> {

    })
  }

  ngOnInit() {
    this.formBin = this.formBuilder.group({
      company: ["", Validators.required],
      bin: ["", Validators.required],
    });
    this.getCompanies();
    this.getBanks();
  }

  submit() {
    if (this.formBin.valid) {
      this.dataService.showLoading(true);
      let body = {
        virtual_account_company_id: this.formBin.get('company').value,
        bin: this.formBin.get('bin').value,
      }

      this.VirtualAccountBinService.create(body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        })
        this.router.navigate(['virtual-account', 'companies']);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      })
      commonFormValidator.validateAllFields(this.formBin);
    }
  }
}
