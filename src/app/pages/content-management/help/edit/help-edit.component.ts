import { Component, OnInit, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { HelpService } from 'app/services/content-management/help.service';
import { DataService } from '../../../../services/data.service';
import { Config } from 'app/classes/config';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-help-edit',
  templateUrl: './help-edit.component.html',
  styleUrls: ['./help-edit.component.scss'],
})
export class HelpEditComponent {

  @ViewChild('chipList') chipList: MatChipList;
  formHelp: FormGroup;
  formHelpError: any;
  detailHelp: any;

  keywordVisible: boolean = true;
  keywordSelectable: boolean = true;
  keywordRemovable: boolean = true;
  keywordAddOnBlur: boolean = true;
  readonly keywordSeparatorKeysCodes: number[] = [ENTER, COMMA];
  keywords: string[] = [];
  isValidFile: boolean;
  isPreview: boolean;

  userGroup: any[] = [
    { name: "Please Wait...", value: "" },
  ];

  categoryGroup: any[] = [
    { name: "Please Wait...", value: "" },
  ];
  jenisGroup: any[] = [
    { name: "Jenis", value: "" },
    { name: "Info", value: "help" },
    { name: "Video", value: "video" },
  ];

  files: File;
  validComboDrag: Boolean;

  public options: Object = Config.FROALA_CONFIG;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private helpService: HelpService,
    private dataService: DataService,
    private ls: LanguagesService
  ) {
    this.formHelpError = {
      title: {},
      body: {},
      user: {},
      category: {},
      otherkeyword: {},
    };
    this.isValidFile = true;
    this.isPreview = true;

    this.detailHelp = this.dataService.getFromStorage('detail_help');
    if (this.detailHelp.opsiDetail !== undefined) {
      if (this.detailHelp.opsiDetail == "preview") {
        this.isPreview = true;
      } else {
        this.isPreview = false;
      }
    }

  }

  ngOnInit() {
    this.formHelp = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required],
      video_url: [""],
      type: ["", Validators.required],
      category: ["", Validators.required],
      otherkeyword: ["", Validators.required]
    });

    this.formHelp.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formHelp, this.formHelpError);
    });

    this.getShow();
    // this.getListCategory();
    this.getListUser();

    this.formHelp.get('otherkeyword').statusChanges.subscribe(
      status => {
        this.chipList.errorState = status === 'INVALID';
      }
    );
    this.formHelp.get('user').valueChanges.subscribe(value => {
      this.formHelp.get('category').setValue('');
      this.formHelp.get('category').setValidators([]);
      this.getListCategory();
    })

  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add keyword
    if ((value || '').trim()) {
      this.keywords.push(value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
      if (this.keywords.length > 0) {
        this.formHelp.get('otherkeyword').setValue(value);
        this.chipList.errorState = false;
      } else {
        this.chipList.errorState = true;
      }
    }
  }

  remove(keyword: string): void {
    const index = this.keywords.indexOf(keyword);
    //remove keyword
    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
  }

  getListCategory() {
    const user = this.formHelp.get('user').value;
    this.helpService.getListCategory({user}).subscribe(
      (res: any) => {
        this.categoryGroup = res.data.map((item: any) => {
          return (
            { name: item.category, value: item.id }
          );
        });
      },
      err => {
        this.categoryGroup = [];
        console.error(err);
      }
    );
  }


  getListUser() {
    this.helpService.getListUser().subscribe(
      (res: any) => {
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

  getShow() {
    this.helpService.getShow(null, { content_id: this.detailHelp.id }).subscribe(
      (res: any) => {
        this.detailHelp.image_url = res.data.image_url;
        this.formHelp.setValue({
          title: res.data.title,
          user: this.detailHelp.user,
          category: res.data.content_category_id,
          type: res.data.type || '',
          video_url: res.data.video_url,
          otherkeyword: res.data.keyword ? (JSON.parse(res.data.keyword).length > 0 ? res.data.keyword : "") : "",
          body: res.data.body,
        });

        this.keywords = res.data.keyword ? JSON.parse(res.data.keyword) : [];
      },
      err => {
        console.error(err);
      }
    );
  }

  removeImage(): void {
    this.files = undefined;
    this.isValidFile = true;
  }

  onFilesChange() {
    setTimeout(() => {
      if (this.files.size > 500000) {
        this.isValidFile = false;
      } else {
        this.isValidFile = true;
      }
    }, 500);
  }

  onTypeChange({value}) {

    if (value === 'video') {

      this.formHelp.get('video_url').setValidators([Validators.required]);

      const category = this.formHelp.get('category');
      category.setValidators([]);
      category.setValue('');
      this.formHelp.updateValueAndValidity();

    } else if (value === 'help') {

      const video_url = this.formHelp.get('video_url');
      const category = this.formHelp.get('category');
      video_url.setValidators([]);
      video_url.setValue('');
      category.setValidators([Validators.required]);
      this.formHelp.updateValueAndValidity();


    }
  }

  submit(): void {
    console.log('FormHelp', this.formHelp);
    if (this.keywords.length == 0) {
      this.formHelp.get('otherkeyword').setValue('');
    }
    else {
      if (this.keywords.length > 0) {
        this.formHelp.get('otherkeyword').setValue(this.keywords);
      }
      if (this.formHelp.valid && !this.files || this.formHelp.valid && this.files && this.files.size < 500000) {
        let body = new FormData();
        body.append('_method', 'PUT');
        body.append('title', this.formHelp.get("title").value);
        body.append('body', this.formHelp.get("body").value);
        body.append('user', this.formHelp.get("user").value);
        body.append('content_category_id', this.formHelp.get("category").value);
        body.append('type', this.formHelp.get('type').value);
        // body.append('keyword', this.formHelp.get("otherkeyword").value);
        body.append('keyword', JSON.stringify(this.keywords));
        // body.append('type', 'help');
        body.append('is_notif', '0');
        if (this.files) body.append('image', this.files);
        body.append('video_url', this.formHelp.get('video_url').value);

        this.helpService.put(body, { content_id: this.detailHelp.id }).subscribe(
          res => {
            // this.loadingIndicator = false;
            this.router.navigate(["content-management", "help"]);
            this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
            window.localStorage.removeItem('detail_help');
          },
          err => {
            this.dialogService.openSnackBar({ message: err.error.message });
            // this.loadingIndicator = false;
          }
        );
      } else {
        let msg;
        if (this.formHelp.invalid)
          msg = "Silahkan lengkapi data terlebih dahulu!";
        else if (this.files && this.files.size >= 500000)
          msg = "Ukuran gambar tidak boleh melebihi 500KB!";

        this.dialogService.openSnackBar({ message: msg });
        commonFormValidator.validateAllFields(this.formHelp);
      }
    }
  }

}
