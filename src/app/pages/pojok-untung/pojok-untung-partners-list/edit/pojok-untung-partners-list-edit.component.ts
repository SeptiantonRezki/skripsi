import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Config } from 'app/classes/config';
import { PagesName } from 'app/classes/pages-name';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { PojokUntungPartnersListService } from 'app/services/pojok-untung/pojok-untung-partners-list.service';

@Component({
  selector: 'app-pojok-untung-partners-list-edit',
  templateUrl: './pojok-untung-partners-list-edit.component.html',
  styleUrls: ['./pojok-untung-partners-list-edit.component.scss']
})
export class PojokUntungPartnersListEditComponent implements OnInit {
  public options: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Detail Deskripsi");

  formPartner: FormGroup;
  validComboDrag: Boolean;

  partner_logo: File;
  partner_logo_url: any;

  partner_type: any = -9;
  partnerTypeList: any[];

  shortDetail: any;
  detailTemplate: any;

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private PojokUntungPartnersListService: PojokUntungPartnersListService,
  ) { 
    this.shortDetail = this.dataService.getFromStorage('edit_pojok_untung_partners_list');
    this.permission = this.roles.getRoles('principal.pojokuntung_partner');
  }

  ngOnInit() {
    this.formPartner = this.formBuilder.group({
      partner_type: ["", Validators.required],
      partner_name: ["", Validators.required],
      // partner_alias: ["", Validators.required],
      status: ["", Validators.required],
      content_title: [""],
      content_info: [""]
    });

    this.getPartnerTypeList();
    this.getDetail();
  }

  getPartnerTypeList() {
    this.PojokUntungPartnersListService.getPartnerType({partner_type: this.partner_type}).subscribe(res => {
      this.partnerTypeList = res.data;
    }, err=> { })
  }

  getDetail() {
    this.dataService.showLoading(true);
    this.PojokUntungPartnersListService.show({ id: this.shortDetail.id }).subscribe(res => {
      this.detailTemplate = res.data;
      this.formPartner.get("partner_type").setValue(this.detailTemplate.partner_type ? ["undefined", "null"].indexOf(this.detailTemplate.partner_type) === -1 ? this.detailTemplate.partner_type : null : null);
      this.formPartner.get("partner_name").setValue(this.detailTemplate.partner_name ? ["undefined", "null"].indexOf(this.detailTemplate.partner_name) === -1 ? this.detailTemplate.partner_name : null : null);
      this.formPartner.get("status").setValue(this.detailTemplate.status ? ["undefined", "null"].indexOf(this.detailTemplate.status) === -1 ? this.detailTemplate.status : null : null);
      this.formPartner.get("content_title").setValue(this.detailTemplate.content_title ? ["undefined", "null"].indexOf(this.detailTemplate.content_title) === -1 ? this.detailTemplate.content_title : null : null);
      this.formPartner.get("content_info").setValue(this.detailTemplate.content_info ? ["undefined", "null"].indexOf(this.detailTemplate.content_info) === -1 ? this.detailTemplate.content_info : null : null);
      this.partner_logo = this.detailTemplate.partner_icon ? ["undefined", "null"].indexOf(this.detailTemplate.partner_icon) === -1 ? this.detailTemplate.partner_icon : null : null;
      this.partner_logo_url = this.detailTemplate.partner_icon ? ["undefined", "null"].indexOf(this.detailTemplate.partner_icon) === -1 ? this.detailTemplate.partner_icon : null : null;
    });

    if (!this.permission.ubah) {
      this.formPartner.disable();
    }
    this.dataService.showLoading(false);
  }

  changeImage(evt: any, index: any, type?: string) {
    this.readThis(evt, index, type);
  }

  readThis(inputValue: any, index: any, type?: string): void {
    const imageDimensions = {
      partner: {
        width: 100,
        height: 100
      },
    };
    
    var file: File = inputValue;

    if (type) {
      if (type === 'partner') {
        if (file.size > 1000 * 1000) {
          this.dialogService.openSnackBar({
            message: "File melebihi maksimum 100kb!"
          });
          return;
        }
      }
    }

    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      var img = new Image;
      img.onload = () => {
          var currentImageDimensions = imageDimensions[type];
          // if (type) {
          //   if (img.width !== currentImageDimensions.width || img.height !== currentImageDimensions.height) {
          //     this.dialogService.openSnackBar({
          //       message: "Resolusi gambar tidak sesuai! Silakan upload ulang."
          //     });
          //     return;
          //   }
          // }

          // store image to local memory
          if (type === 'partner') {
            this.partner_logo_url = myReader.result;
          }
      };
      img.src = myReader.result as string;
    }

    myReader.readAsDataURL(file);
  }

  removeImage(i: any, type?: string): void {
    if (type === 'partner') {
      this.partner_logo = null;
      this.partner_logo_url = null;
    }
  }

  submit() {
    if (this.formPartner.valid) {
      this.dataService.showLoading(true);

      let fd = new FormData();
      fd.append('id', this.detailTemplate.id);
      fd.append('partner_type', this.formPartner.get('partner_type').value);
      fd.append('partner_name', this.formPartner.get('partner_name').value);
      // fd.append('partner_alias', this.formPartner.get('partner_alias').value);
      fd.append('content_title', this.formPartner.get('content_title').value);
      fd.append('content_info', this.formPartner.get('content_info').value);
      fd.append('status', this.formPartner.get('status').value);
      fd.append('partner_icon', this.partner_logo);

      this.PojokUntungPartnersListService.store(fd).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.router.navigate(['pojok-untung', 'partners-list']);
      })
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });
      commonFormValidator.validateAllFields(this.formPartner);
    }
  }

}
