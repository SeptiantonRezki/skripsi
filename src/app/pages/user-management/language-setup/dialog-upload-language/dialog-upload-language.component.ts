import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { LanguageSetupService } from 'app/services/user-management/language-setup.service';

@Component({
  selector: 'app-dialog-upload-language',
  templateUrl: './dialog-upload-language.component.html',
  styleUrls: ['./dialog-upload-language.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogUploadLanguageComponent implements OnInit {

  files: File;
  validComboDrag: boolean;
  show: Boolean;

  uploading: Boolean;
  validating: Boolean;
  isValid: Boolean = false;
  validated: Boolean;

  rows: any[];
  data: any;
  formData: FormData;

  constructor(
    public dialogRef: MatDialogRef<DialogUploadLanguageComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private ls: LanguagesService,
    private dialogService: DialogService,
    private dataService: DataService,
    private languageSetupService: LanguageSetupService,
  ) {
    this.rows = [];
    this.formData = new FormData();

    if (data) {
      this.data = data;
      this.show = true;
    }
  }

  ngOnInit() {
  }
  preview(event) {
    console.log({event});
    this.files = undefined;
    this.files = event;

    console.log('files info', this.files);
    if (this.files.name.indexOf(".json") < 0) {
      this.dialogService.openSnackBar({ message: this.ls.locale.language_setup.json_extension });
      return;
    }
    this.validated = false;
    this.formData = new FormData();
    this.formData.append('name', this.data.name);
    this.formData.append('type', this.data.type);
    this.formData.append('file', this.files);
  }

  validate() {
    // this.uploading = true;
    this.validating = true;
    this.validated = true;
    this.languageSetupService.validate(this.formData).subscribe(res => {
      // this.uploading = false;
      // setTimeout(() => {
        
        this.validating = false;
        this.isValid = res.is_valid;
        if(!res.is_valid) {
          this.files = undefined;
          this.rows = this.getInvalidData(res.result);
          
        }

      // }, 5000);
    }, err => {
      this.validating = false;
      // this.uploading = false;
    });
  }

  getInvalidData(data) {
    const invalids = [];

    const recurse = (items, parent = '') => {
      if(items && items.length) {
        items.map(item => {
          let _parent = (parent) ? parent + '.' + item.parameter : item.parameter;
          
          if(!item.status) {
            invalids.push({
              key: _parent,
              value: (typeof item.data === 'string') ? item.data : '',
              reason: this.ls.locale.language_setup.attribute_not_found
            });
          }
          
          if(typeof item.data === 'object') {
            recurse(item.data, _parent)
          }
  
        })
      } else {
        // console.log({items});
      }
    }
    recurse(data);
    console.log({data, invalids});
    return invalids;
  }

  submit() {
    if (this.files) {

      // this.dataService.showLoading(true);
      this.dialogRef.close(this.formData);
      // this.scheduleTradeProgramService.storeExcel(res).subscribe(res => {
      //   this.dataService.showLoading(false);
      //   this.dialogRef.close(res);
      // })

    } else {
      this.dialogService.openSnackBar({ message: this.ls.locale.language_setup.file_limit_message })
    }
  }

  setRedIfDuplicate(item) {
    if (item.flag) return '#C62728';
  }

}
