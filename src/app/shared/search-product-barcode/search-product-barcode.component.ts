import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ProductService } from "app/services/sku-management/product.service";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

@Component({
  selector: "search-product-barcode",
  templateUrl: "./search-product-barcode.component.html",
  styleUrls: ["./search-product-barcode.component.scss"],
})
export class SearchProductBarcodeComponent implements OnInit {
  isInitFetching: boolean = true;
  isFetching: boolean = false;
  filteredOptions: Array<any> = [];
  search: FormControl = new FormControl("");
  filterDestroy = new Subject();
  selected: FormControl = new FormControl({ id: "", name: "" });
  initData:Array<any> = []

  @Input() value: any;

  @Input() inputPlaceHolder: string;

  @Input() errorMessage: string;

  @Input() isBrandFamily: boolean = false;
  
  @Input() disabled: boolean = false;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  @ViewChild("searchInput") searchInput: ElementRef;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.search.valueChanges
      .pipe(debounceTime(300))
      .pipe(takeUntil(this.filterDestroy))
      .subscribe(() => this.getData());
    if (this.value) {
      this.search.setValue(this.value.name);
      this.selected.setValue(this.value);
      this.getData(true);
    }
    this.selected.valueChanges.subscribe((value) => {
      this.onChange.emit(value);
    });
    if(this.disabled)this.search.disable()
  }

  ngAfterViewInit() {
    // fetching
    this.getTheData("", true)
    // setTimeout(() => {
    //   this.filteredOptions = [
    //     { id: 1, name: "satu" },
    //     { id: 2, name: "dua" },
    //   ]

    // }, 2000);
  }

  getData(bypass: boolean = false) {
    const search = this.search.value;
    if (!bypass && this.searchInput.nativeElement !== document.activeElement) {
      return;
    }
    if (!search) {
      this.filteredOptions = this.initData;
      return;
    }
    this.isFetching = true;
    this.getTheData(search)
  }

  getTheData(search = "", init=false){
    if (this.isBrandFamily) {
      
    } else {

    }
    this.productService.getProductBarcodes({ barcode: search }).subscribe((res) => {
      const response = res.data || {};
      const list = response.data.map(({ barcode, name }) => ({
        id: barcode,
        name,
      }));
      this.filteredOptions = list;
      this.isFetching = false;
      if(init){
        this.isInitFetching = false;
        this.initData = list
      }
    });
  }

  getSelected(option: any) {
    this.searchInput.nativeElement.blur();
    setTimeout(() => {
      this.search.setValue(option.viewValue);
      this.selected.setValue({ id: option.value, name: option.viewValue });
    }, 0);
  }

  onClosed() {
    if (!this.selected.value.id) return;
    if (!this.search.value) {
      this.selected.setValue({ id: "", name: "" });
      return;
    }
    if (this.search.value !== this.selected.value.name) {
      this.search.setValue(this.selected.value.name);
    }
  }

  clear() {
    this.search.setValue("");
    this.selected.setValue({ id: "", name: "" });
    this.filteredOptions = this.initData;
    setTimeout(() => this.searchInput.nativeElement.blur(), 0);
  }

  isLoading() {
    if (this.isInitFetching) {
      return true;
    }
    if (this.search.value) {
      if (this.isFetching) {
        return true;
      } else {
        return false;
      }
    }
  }
}
