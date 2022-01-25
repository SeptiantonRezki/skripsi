import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { LanguageSetupService } from 'app/services/user-management/language-setup.service';
import { DialogUploadLanguageComponent } from '../dialog-upload-language/dialog-upload-language.component';
import * as _ from 'underscore';

@Component({
  selector: 'app-language-setup-edit',
  templateUrl: './language-setup-edit.component.html',
  styleUrls: ['./language-setup-edit.component.scss']
})
export class LanguageSetupEditComponent implements OnInit {

  step1: FormGroup;
  step2: FormGroup;
  step3: FormGroup;
  step4: FormGroup;
  
  dialogRef: any;
  submiting = false;
  language;
  LANGUAGE_TYPES = {
    RETAILER: 'retailer',
    WHOLESALER: 'wholesaler',
    PRINCIPAL: 'principal',
  }
  isDetail = false;

  constructor(
    private ls: LanguagesService,
    private router: Router,
    private formBuilder:FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private languageSetupService: LanguageSetupService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.language = dataService.getFromStorage("language_setup_data");
    
    activatedRoute.url.subscribe(params => {
      console.log({params});
      this.isDetail = params[1].path === 'detail' ? true : false;
    });

    this.step1 = formBuilder.group({
      name: [this.language.name, Validators.required]
    });

    this.step2 = formBuilder.group({
      type: [this.LANGUAGE_TYPES.RETAILER],
      file: [null],
      filename: ['', Validators.required],
    });
    this.step3 = formBuilder.group({
      type: [this.LANGUAGE_TYPES.WHOLESALER],
      file: [null],
      filename: ['', Validators.required],
    });
    this.step4 = formBuilder.group({
      type: [this.LANGUAGE_TYPES.PRINCIPAL],
      file: [null],
      filename: ['', Validators.required],
    });

  }

  ngOnInit() {
    this.step2.get('filename').setValue( this.getFileName(this.LANGUAGE_TYPES.RETAILER) );
    this.step3.get('filename').setValue( this.getFileName(this.LANGUAGE_TYPES.WHOLESALER) );
    this.step4.get('filename').setValue( this.getFileName(this.LANGUAGE_TYPES.PRINCIPAL) );
  }

  getFileName(langType) {
    try {

      const file = _.find(this.language.files, item => item.type === langType)
      let paths = file.path.split('/');
      return paths[paths.length - 1];

    } catch (error) {
      console.log({error});
      return '';
    }
  }

  validateStep(step) {

  }
  openFile(type, step) {
    // if (this.dataScheduler.status_berjalan === "expired") {
    //   return this.dialogService.openSnackBar({ message: `Tidak dapat adjust coin karna status scheduler trade program telah ${this.dataScheduler.status_berjalan}` });
    // }

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'dialog-upload-language';
    dialogConfig.data = {
      name: this.step1.get('name').value,
      type
    };

    this.dialogRef = this.dialog.open(DialogUploadLanguageComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe((data: FormData) => {

      if (data && data.get('file')) {
        
        const file = data.get('file') as File;
        let form: FormGroup;
        switch (step) {
          case 2: form = this.step2; break;
          case 3: form = this.step3; break;
          case 4: form = this.step4; break;
        }
        
        console.log({filename: file.name });
        form.get('file').setValue(file);
        form.get('filename').setValue(file.name);
        // this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
      }
    })
  }
  submit() {
    this.submiting = true;

    const fd = new FormData();
    fd.append('name', this.step1.get('name').value);
    fd.append("json_files[0][type]", this.step2.get('type').value);
    fd.append("json_files[0][file]", this.step2.get('file').value);
    fd.append("json_files[1][type]", this.step3.get('type').value);
    fd.append("json_files[1][file]", this.step3.get('file').value);
    fd.append("json_files[2][type]", this.step4.get('type').value);
    fd.append("json_files[2][file]", this.step4.get('file').value);

    this.languageSetupService.update(fd, {id: this.language.id}).subscribe(res => {

      this.submiting = false;
      this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
      this.router.navigate(["user-management", "languages"]);

    }, err => {
      
      this.submiting = false;

    })

  }

}
