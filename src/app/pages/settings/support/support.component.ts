import { Component, OnInit,} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap, finalize, tap} from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { SupportService } from 'app/services/settings/support.service';
import { DialogOtherHelp } from './content/dialog/dialog-other-help';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

  selected = new FormControl(0);
  onLoad: Boolean;
  listHelp: any[];
  detailTnc: any;
  detailPrivacy: any;
  filteredOptions: Observable<any[]>;
  menuButtons: any;
  menuButtonOthers: any;
  listCategoryDetails: any;
  onLoadDetail: Boolean;
  isListCategoryDetails: any;
  helpDetail: any;
  isLike: boolean;
  isUnlike: boolean;
  delayTimer: any;
  searchData: any;
  isLoading: boolean;
  myControl = new FormControl();
  selectedIndex: any;
  isFound: boolean;
  selectedTab: Number;

  constructor(
    private supportService: SupportService,
    public dialog: MatDialog,
  ) {
    this.onLoad = true;
    this.menuButtons = [];
    this.menuButtonOthers = [];
    this.listCategoryDetails = [];
    this.onLoadDetail = false;
    this.isListCategoryDetails = false;
    this.helpDetail = null;
    this.isLike = false;
    this.isUnlike = false;
    this.delayTimer = null;
    this.searchData = [];
    this.isLoading = false;
    this.selectedIndex = -1;
    this.isFound = false;
    this.selectedTab = 0;
  }

  ngOnInit() {

    this.supportService.getBantuanListCategory({ user: 'principal' }).subscribe((res: any) => {
      this.menuButtons = res.data;
      this.onLoad = false;
    })

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        tap(() => this.isLoading = true),
        distinctUntilChanged(),
        switchMap(value => this._filter(value)
        )
      )

    this.menuButtonOthers = [
      {
        category: 'Telepon',
        title: '0804-1000-234',
        image_url: 'assets/images/ayo/bantuan/kontak-telepon2x.png'
      },
      {
        category: 'Chat',
        title: 'CHAT KE KAMI LANGSUNG',
        image_url: 'assets/images/ayo/bantuan/kontak-chat2x.png'
      },
      {
        category: 'E-Mail',
        title: 'ayosrc@src.id',
        image_url: 'assets/images/ayo/bantuan/kontak-email2x.png'
      }
    ];
  }

  private _filter(value: string) {
      return this.supportService.search({keyword: value, user: 'principal'}).pipe(
        map((option: any) => {
          console.log('option', option);
          if (option.data.length > 0){
            this.isFound = true;
            return option.data;
          } else {
            this.isFound = false;
            return [{
              id: null,
              title: "",
              text: "HASIL PENCARIAN untuk \"" + value + "\" tidak ditemukan. Mohon hubungi tim Digital Care untuk pertanyaan ini.",
              value: value
            }];
          }
        })
      );
  }

  searchHelp(value: any){
    // clearTimeout(this.delayTimer);
    // this.delayTimer = setTimeout(function() {
      this.supportService.search({keyword: value, user: 'principal'}).subscribe((res: any) => {
        this.searchData = res.data;
        this.filteredOptions = res.data;
      }, (err: any) => console.log('err search', err));
    // }, 1000);
    return this.filteredOptions;
  }

  openListCategoryDetails(param: any, index?: number) {
    if(index !== undefined){
      if(this.selectedIndex !== index) this.listCategoryDetails = [];
      this.selectedIndex = index;
    } else {
      this.selectedIndex = 0;
    }
    this.onLoadDetail = true;
    this.isListCategoryDetails = true;
    this.helpDetail = null;
    
    this.supportService.getBantuanListCategoryDetails({ id: param.id, user: 'principal' }).subscribe((res: any) => {
      this.listCategoryDetails = res.data;
      this.onLoadDetail = false;
    }, err => console.log('err getBantuanListCategoryDetails', err));
  }

  openHelpDetails(val: any) {
    if (val.id !== null) {
      this.onLoadDetail = true;
      this.isListCategoryDetails = true;
      this.supportService.getBantuanShowDetail({ id: val.id }).subscribe((res: any) => {
        this.helpDetail = res.data;
        this.isLike = res.data.help_status == 1;
        this.isUnlike = res.data.help_status == 2;
        this.listCategoryDetails = null;
        this.onLoadDetail = false;
        this.menuButtons.map((item: any, i: number) => {
          if(res.data.content_category_id == item.id){
            this.selectedIndex = i;
          }
        });
      }, err => console.log('err getBantuanListCategoryDetails', err));
    }
  }

  backToPusatBantuan() {
    this.isListCategoryDetails = false;
    this.helpDetail = null;
    this.listCategoryDetails = [];
    this.selectedIndex = -1;
  }

  like(item: any) {
    if (item.help_status !== 1) {
      this.isLike = true;
      this.isUnlike = false;
      this.helpDetail.likes_count += 1;
      if (item.help_status == 2) {
        this.helpDetail.unlikes_count -= 1;
      }
      this.helpDetail.help_status = 1;
      this.supportService.like({id: item.id}).subscribe((res: any) => {
      }, err => console.log('err like', err));
    }
  }

  unlike(item: any) {
    if (item.help_status !== 2) {
      this.isLike = false;
      this.isUnlike = true;
      this.helpDetail.unlikes_count += 1;
      if (item.help_status == 1) {
        this.helpDetail.likes_count -= 1;
      }
      this.helpDetail.help_status = 2;
      this.supportService.unlike({id: item.id}).subscribe((res: any) => {
      }, err => console.log('err unlike', err));
    }
  }

  onHelpNext() {
    this.openDialogChat();
  }

  deleteSearch() {
    this.myControl.setValue('');
  }

  menuButtonOtherDetail(item: any) {
    if (item.category == 'Telepon') {
      this.openDialogTelepon();
    } else if (item.category == 'E-Mail') {
      this.openDialogEmail();
    } else {
      this.openDialogChat();
    }
  }

  openDialogTelepon(): void {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { target: '0804-1000-234', description: 'Silahkan hubungi nomor di bawah untuk berbicara langsung dengan tim Customer Care AYOSRC'};
    const dialogRef = this.dialog.open(DialogOtherHelp, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openDialogEmail(): void {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { target: 'CSAYOSRC@SRC.ID', description: 'Silahkan e-mail alamat di bawah ini untuk menghubungi tim Customer Care AYOSRC'};
    const dialogRef = this.dialog.open(DialogOtherHelp, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openDialogChat(e?: any): void {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { target: '', description: 'Fitur ini akan segera tersedia untuk anda. Nantikan kehadiran fitur ini segera eksklusif hanya untuk pengguna AYOSRC'};
    const dialogRef = this.dialog.open(DialogOtherHelp, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed '+ e, this.selectedTab);
      if(e == 'tab'){
        this.selectedTab = 0;
      }
      console.log('The dialog was closed after'+ this.selectedTab, this.selectedTab);
    });
  }

  selectedTabChange(index: number) {
    this.selectedTab = index;
    if(index == 1){
      this.openDialogChat('tab');
    }
  }

}
