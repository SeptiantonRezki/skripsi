import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { VirtualAccountTncService } from 'app/services/virtual-account/virtual-account-tnc.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { HelpService } from 'app/services/content-management/help.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-virtual-account-tnc-create',
  templateUrl: './virtual-account-tnc-create.component.html',
  styleUrls: ['./virtual-account-tnc-create.component.scss']
})
export class VirtualAccountTncCreateComponent implements OnInit {
  formTnc: FormGroup;
  formTncError: any;

  public options: Object = Config.FROALA_CONFIG;
  userGroup: any[] = [];
  // listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private VirtualAccountTncService: VirtualAccountTncService,
    private helpService: HelpService
  ) {

  }

  ngOnInit() {
    this.formTnc = this.formBuilder.group({
      title: ["", Validators.required],
      user_group: ["", Validators.required],
      body: ["", Validators.required],
    });

    this.getUserGroups();
  }

  getUserGroups() {
    this.helpService.getListUser().subscribe(
      (res: any) => {
        console.log('getListUser', res);
        this.userGroup = res.data.map((item: any) => {
          return (
            { name: item, value: item }
          );
        });
      },
      err => {
        this.userGroup = [];
        console.error(err);
      }
    );
  }

  numbersOnlyValidation(event) {
    const inp = String.fromCharCode(event.keyCode);
    /*Allow only numbers*/
    if (!/^\d+$/.test(inp)) {
      event.preventDefault()
    }
  }

  submit() {
    if (this.formTnc.valid) {
      this.dataService.showLoading(true);
      let body = {
        title: this.formTnc.get('title').value,
        user_group: this.formTnc.get('user_group').value,
        body: this.formTnc.get("body").value,
      }

      this.VirtualAccountTncService.create(body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        })
        this.router.navigate(['virtual-account', 'terms-and-condition']);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      })
      commonFormValidator.validateAllFields(this.formTnc);
    }
  }
}
