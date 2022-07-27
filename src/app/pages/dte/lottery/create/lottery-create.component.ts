import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-lottery-create',
  templateUrl: './lottery-create.component.html',
  styleUrls: ['./lottery-create.component.scss']
})
export class LotteryCreateComponent implements OnInit {
  selectedTab: number = 0;

  formSpin: FormGroup;
  onLoad: boolean;
  minDate = new Date();
  groupTradePrograms: any[] = [];

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;
  imageConverted: any;
  preview_header: FormControl = new FormControl("");


  constructor(
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.onLoad = true
  }

  ngOnInit() {
    this.formSpin = this.formBuilder.group({
      name: ["", Validators.required],
      group_trade_id: ["", Validators.required],
      start_date: [new Date()],
      end_date: [new Date()],
    })

    this.onLoad = false;
  }

  removeImage(): void {
    this.files = undefined;
    this.imageConverted = undefined;
  }

  changeImage(event) {
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageConverted = myReader.result;
    }

    myReader.readAsDataURL(file);
  }

}
