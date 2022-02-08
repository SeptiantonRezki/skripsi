import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ReplaySubject, Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

@Component({
  selector: "select-search",
  templateUrl: "./select-search.component.html",
  styleUrls: ["./select-search.component.scss"],
})
export class SelectSearchComponent implements OnInit {
  @Output() onChange: EventEmitter<any[]> = new EventEmitter();
  @Output() onScrollApi: EventEmitter<any> = new EventEmitter();
  @Output() onSearchApi: EventEmitter<any> = new EventEmitter();
  @Input() placeholder: string = "";
  @Input() searchLabel: string = "";
  @Input() value: any;
  @Input() sortByName: boolean = false;
  @Input() scrollApi: boolean = false;
  @Input() searchApi: boolean = false;

  @Input()
  set options(value: any[]) {
    this.optionList.setValue(value);
    this.initOptions();
  }

  isFetching: boolean = false;
  disableSearch: boolean = false;
  search: FormControl = new FormControl();
  optionList: FormControl = new FormControl();
  filteredOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filterDestroy = new Subject();
  isScroll: boolean = false;
  scrollCount: number = 0;

  ngOnInit() {
    this.initOptions();
    this.search.valueChanges
      .pipe(debounceTime(300))
      .pipe(takeUntil(this.filterDestroy))
      .subscribe(() => {
        this.filtering();
      });
    this.optionList.valueChanges.subscribe(() => {
      this.isScroll = false;
      this.scrollCount = this.scrollCount + 1;
    });
  }

  initOptions() {
    if (!this.optionList) return;
    this.disableSearch = this.optionList.value.length < 5;
    if (this.sortByName) {
      this.optionList.value.sort((a: any, b: any) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    }
    this.filteredOptions.next(this.optionList.value.slice());
  }

  filtering() {
    const search = this.search.value;
    if (!this.optionList) return;
    if (!search) {
      this.filteredOptions.next(this.optionList.value.slice());
      return;
    }
    const list = this.optionList.value.filter(
      (item: any) =>
        item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
    )
    this.filteredOptions.next(list);
    if (this.searchApi && !list.length) {
      this.isFetching = true;
      this.onSearchApi.emit();
      return;
    }
  }

  handleSelectionChange(event: any) {
    this.onChange.emit(event.value);
  }

  handleScroll() {
    if (!this.scrollApi || this.search.value) return;
    this.isScroll = true;
    setTimeout(() => {
      this.onScrollApi.emit(this.scrollCount);
    }, 1000);
  }

  isLoading() {
    if (this.search.value) {
      if (this.isFetching) {
        return true;
      } else {
        return false;
      }
    } else {
      if (this.scrollApi) {
        return true;
      }
    }
  }
}
