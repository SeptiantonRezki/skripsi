import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { VirtualAccountTncService } from 'app/services/virtual-account/virtual-account-tnc.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-virtual-account-tnc-create',
  templateUrl: './virtual-account-tnc-create.component.html',
  styleUrls: ['./virtual-account-tnc-create.component.scss']
})
export class VirtualAccountTncCreateComponent implements OnInit {
  formTnc: FormGroup;
  listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private VirtualAccountTncService: VirtualAccountTncService
  ) {

  }

  ngOnInit() {
    this.formTnc = this.formBuilder.group({
      name: ["", Validators.required],
      contact: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      flowingly_id: ["", Validators.required],
      status: ["", Validators.required],
      minimum_transaction: [0, Validators.required],
      service_cost: [0, Validators.required]
    });

    let regex = new RegExp(/[0-9]/g);
    this.formTnc.get('contact').valueChanges.subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.formTnc.get('contact').setValue(phone, { emitEvent: false });
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
    if (this.formTnc.valid) {
      this.dataService.showLoading(true);
      let body = {
        name: this.formTnc.get('name').value,
        contact: '+62' + this.formTnc.get('contact').value,
        email: this.formTnc.get('email').value,
        flowingly_id: this.formTnc.get('flowingly_id').value,
        status: this.formTnc.get('status').value,
        minimum_transaction: this.formTnc.get('minimum_transaction').value,
        service_cost: this.formTnc.get('service_cost').value,
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
