import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { PrincipalPartnershipService } from 'app/services/principal-partnership/principal-partnership.service';
import { MatDialog } from '@angular/material';
import { commonFormValidator } from "app/classes/commonFormValidator";

@Component({
  selector: 'app-partnership-create',
  templateUrl: './partnership-create.component.html',
  styleUrls: ['./partnership-create.component.scss']
})
export class PartnershipCreateComponent implements OnInit {
  formPrincipal: FormGroup;
  formPrincipalError: any;

  valueChange: Boolean;
  loadingIndicator: Boolean;
  saveData: Boolean;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.valueChange && !this.saveData)
      return false;

    return true;
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private principalPartnershipService: PrincipalPartnershipService,
    private dialog: MatDialog
  ) {
    this.saveData = false;
    this.formPrincipalError = {
      name: {}
    }
  }

  ngOnInit() {
    this.formPrincipal = this.formBuilder.group({
      name: ["", Validators.required]
    });

    this.formPrincipal.valueChanges.subscribe(() => {
      this.valueChange = true;
    })
  }

  submit() {
    if (this.formPrincipal.valid) {
      let body = {
        name: this.formPrincipal.get("name").value
      };

      this.saveData = true;
      this.principalPartnershipService.create(body).subscribe(res => {
        console.log('res creating!', res);
        this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan' })
        this.router.navigate(['user-management', 'principal-partnership']);
      }, err => console.log('err creating!', err.error.message));
    } else {
      commonFormValidator.validateAllFields(this.formPrincipal);

      this.dialogService.openSnackBar({ message: "Silahkan lengkapi data terlebih dahulu!" });
    }
  }
}
