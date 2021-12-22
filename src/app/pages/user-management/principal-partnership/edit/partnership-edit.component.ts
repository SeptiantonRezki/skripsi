import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { PrincipalPartnershipService } from 'app/services/principal-partnership/principal-partnership.service';
import { MatDialog } from '@angular/material';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-partnership-edit',
  templateUrl: './partnership-edit.component.html',
  styleUrls: ['./partnership-edit.component.scss']
})
export class PartnershipEditComponent implements OnInit {
  formPrincipal: FormGroup;
  formPrincipalError: any;
  detailPrincipal: any;
  detailPrincipalSelected: any;

  valueChange: Boolean;
  saveData: Boolean;
  dialRef: any;
  isDetail: Boolean;

  private _onDestroy = new Subject<void>();

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.isDetail) return true;

    if ((this.valueChange && !this.saveData)) {
      return false;
    }

    return true;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private principalPartnershipService: PrincipalPartnershipService,
    private dialog: MatDialog,
    private ls: LanguagesService
  ) {
    this.saveData = false;
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.formPrincipalError = {
      name: {}
    };

    this.detailPrincipal = this.dataService.getFromStorage("detail_principal_partnership");
  }

  ngOnInit() {
    this.formPrincipal = this.formBuilder.group({
      name: ["", Validators.required],
    });

    this.formPrincipal.valueChanges.subscribe(() => {
      this.valueChange = true;
    });

    this.initPrincipalPartnership();
  }

  initPrincipalPartnership() {
    this.formPrincipal.get("name").setValue(this.detailPrincipal.name);
  }

  submit() {
    if (this.formPrincipal.valid) {
      let body = {
        _method: "PUT",
        name: this.formPrincipal.get("name").value
      };

      this.principalPartnershipService.put(body, { principal_partnership_id: this.detailPrincipal.id }).subscribe(res => {
        console.log('res creating', res);
        this.dialogService.openSnackBar({ message: 'Data Berhasil Diubah' })
        this.router.navigate(['user-management', 'principal-partnership']);
        window.localStorage.removeItem('detail_principal_partnership');
      })
    } else {
      commonFormValidator.validateAllFields(this.formPrincipal);

      this.dialogService.openSnackBar({ message: "Silahkan lengkapi data terlebih dahulu!" });
    }
  }

  updatePrincipalPartnership() {
    console.log('update function fired!');
  }
}
