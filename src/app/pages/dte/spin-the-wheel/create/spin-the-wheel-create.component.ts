import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { COMMA, ENTER, SEMICOLON } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-spin-the-wheel-create',
  templateUrl: './spin-the-wheel-create.component.html',
  styleUrls: ['./spin-the-wheel-create.component.scss']
})
export class SpinTheWheelCreateComponent implements OnInit {
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

  keyUp = new Subject<string>();
  keyUpProduct = new Subject<string>();
  listCategories: any[] = [];
  listProduct: any[] = [];
  filterProduct: FormControl = new FormControl("");
  public filteredProduct: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  listProductSkuBank: Array<any> = [];
  filteredSkuOptions: Observable<string[]>;
  productList: any[] = [];
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON];
  inputChipList = [];


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
      limit_only: [""],
      limit_by_product: [false],
      limit_by_category: [false],
      product: [""],
      category: [""],
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
