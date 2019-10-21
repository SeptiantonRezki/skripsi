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
        return option.data;
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

  openListCategoryDetails(param: any) {
    this.onLoadDetail = true;
    this.isListCategoryDetails = true;
    this.supportService.getBantuanListCategoryDetails({ id: param.id, user: 'principal' }).subscribe((res: any) => {
      this.listCategoryDetails = res.data;
      this.onLoadDetail = false;
    }, err => console.log('err getBantuanListCategoryDetails', err));
  }

  openHelpDetails(val: any) {
    if(val.type == 'search'){
      this.onLoadDetail = true;
      this.isListCategoryDetails = true;
    }
    // this.selectedIndex = val.idx;
    this.supportService.getBantuanShowDetail({ id: val.id }).subscribe((res: any) => {
      this.helpDetail = res.data;
      this.isLike = res.data.help_status == 1;
      this.isUnlike = res.data.help_status == 2;
      if(val.type == 'search'){
        this.listCategoryDetails = [{
          id: res.data.id,
          title: res.data.title,
        }]
      }
      this.onLoadDetail = false;
    }, err => console.log('err getBantuanListCategoryDetails', err));
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

  menuButtonOtherDetail(item: any) {
    if (item.category == 'Telepon') {
      this.openDialogTelepon();
    } else if (item.category == 'E-Mail') {
      this.openDialogEmail();
    } else {

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
}
