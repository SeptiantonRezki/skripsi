import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PagesName } from 'app/classes/pages-name';
import { AuthenticationService } from 'app/services/authentication.service';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeneralService } from 'app/services/general.service';
import { VendorsService } from 'app/services/src-catalogue/vendors.service';
import * as moment from "moment";
import { ReplaySubject, Subject } from 'rxjs';

@Component({
  selector: 'app-vendor-setting',
  templateUrl: './vendor-setting.component.html',
  styleUrls: ['./vendor-setting.component.scss']
})
export class VendorSettingComponent implements OnInit {
  profile: any;
  onLoad: Boolean;

  about: FormControl = new FormControl("", [
    Validators.required,
    Validators.maxLength(3000)
  ]);

  permission: any;
  permissionProfileToko: any = null;
  permissionLokasiToko: any = null;
  permissionOperasionalToko: any = null;
  permissionLiburToko: any = null;
  permissionRekeningToko: any = null;
  roles: PagesName = new PagesName();

  formProfilToko: FormGroup;
  formLokasiToko: FormGroup;
  formLiburToko: FormGroup;
  formBankAccount: FormGroup;
  formSIUP: FormGroup;
  formOperationalTimeGroup: FormGroup;

  imgTokoDepan: File;
  imgTokoDalam: File;
  imgTokoDepanR: any;
  imgTokoDalamR: any;
  isSlicedOT: boolean = false;

  @ViewChild('gmap') gmapElement: ElementRef;
  map: google.maps.Map;
  marker: any;
  geolocation = new google.maps.Geocoder();

  listBanks: any[];
  filterBank: FormControl = new FormControl();
  filteredBanks: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private _onDestroy = new Subject<void>();
  bankAccountLength: Number = 0;

  listSchedule: any[] = [];

  listDays: any[] = [
    { day_id: 1, day_name: 'SEN' },
    { day_id: 2, day_name: 'SEL' },
    { day_id: 3, day_name: 'RAB' },
    { day_id: 4, day_name: 'KAM' },
    { day_id: 5, day_name: 'JUM' },
    { day_id: 6, day_name: 'SAB' },
    { day_id: 0, day_name: 'MIN' },
  ];

  minDate: any;
  infoWindow = new google.maps.InfoWindow;
  isMap: boolean = false;

  profileIsValid: boolean = false;
  lokasiIsValid: boolean = false;
  scheduleIsValid: boolean = false;
  rekeningIsValid: boolean = false;
  liburIsValid: boolean = false;
  permissionSIUP: any;
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private authenticationService: AuthenticationService,
    private dialogService: DialogService,
    private generalService: GeneralService,
    private vendorService: VendorsService
  ) {
    this.formSIUP = this.formBuilder.group({
      siup_number: [""],
      siup_year: [""]
    });
  }

  ngOnInit() {
    const profile = this.dataService.getDecryptedProfile();
    this.formProfilToko = this.formBuilder.group({
      namaToko: [""],
      namaPemilikToko: [""],
      phone: [""],
      kodeAgen: [""],
      panjangToko: [""],
      lebarToko: [""],
      catatanToko: "",
    })

    this.formLokasiToko = this.formBuilder.group({
      alamatToko: "",
      longitude: ["", Validators.required],
      latitude: ["", Validators.required],
      alamatTokoDetail: ["", Validators.required],
    })

    this.formLiburToko = this.formBuilder.group({
      isLibur: "",
      from: ["", Validators.required],
      to: ["", Validators.required],
      fromTime: ["", Validators.required],
      toTime: ["", Validators.required],
      leaveMessage: "",
    });

    this.formBankAccount = this.formBuilder.group({
      account_number: [""],
      account_name: [""],
      bank_name: [""],
      branch: [""]
    });

    this.formOperationalTimeGroup = this.formBuilder.group({
      formOperationalTime: this.formBuilder.array([])
    });

    this.formOperationalTimeGroup.controls['formOperationalTime'].valueChanges.debounceTime(300).subscribe(res => {
      let ot = this.formOperationalTimeGroup.get('formOperationalTime') as FormArray;
      (res || []).map((item: any, index: number) => {
        if (item.openTime) {
          // console.log('item.openTime', item.openTime)
          // this.checkIrisan
        }
      });
      this.formOperationalTimeGroup.get('formOperationalTime')['controls'].map((val, i) => {
        val.get('openTime').valueChanges.subscribe(data => {
          // console.log('MASUK', val.get('openTime').value)
          // this.checkIrisanTime(i);
          // do something!
        });
        val.get('closedTime').valueChanges.subscribe(data => {
          // console.log('MASUK', val.get('closedTime').value)
          // this.checkIrisanTime(i);
          // do something!
        });
      });
    });

    this.getAuthentication();
  }

  openTimeChanged(event: any, i) {
    const e = event.value;
    console.log('event' + i, event);
  }

  initOperationalTime(): FormGroup {
    return this.formBuilder.group({
      openTime: ["00:00", Validators.required],
      closedTime: ["23:59", Validators.required],
    })
  }

  getAuthentication() {
    this.onLoad = true;
    this.authenticationService.getProfileDetail().subscribe(profile => {
      console.log("profile", profile);
      this.vendorService.getVendorAddress({ vendor_id: profile.vendor_company_id }).subscribe(res => {
        // if (profile.status == "active") {
        this.setProfile({ ...profile, businesses: res.data });
        profile.businesses = [res.data];
        console.log('profile', profile);
        this.profile = profile;
        this.onLoad = false;
        // this.dataService.setToStorage("profile", profile);
        this.dataService.setEncryptedProfile(profile);
        this.initGMap();
      });
    });
  }

  setProfile(value: any) {
    this.setMapToCenter(value.businesses.delivery_latitude, value.businesses.delivery_longitude);
    this.formLokasiToko.get('latitude').setValue(value.businesses.delivery_latitude || '');
    this.formLokasiToko.get('longitude').setValue(value.businesses.delivery_longitude || '');
    this.formLokasiToko.get('alamatToko').setValue(value.businesses.delivery_address || '');
    this.formLokasiToko.get('alamatTokoDetail').setValue(value.businesses.delivery_address_detail || '');

    this.vendorService.getOperationalTime().subscribe(res => {
      value.businesses.operational_time = res.data;
      if (value.businesses.operational_time !== null) {
        this.listSchedule = value.businesses.operational_time.map((item) => {
          let ot = this.formOperationalTimeGroup.get('formOperationalTime') as FormArray;
          let days_ = [];
          let isValid = false;
          this.listDays.map((day, i) => {
            item.days.map((val: any) => {
              if (day.day_id == val.day_id) {
                val.isActive = true;
                days_.push({ ...val });
                isValid = true;
              }
            });
            if (!isValid) {
              days_.push({ ...day });
              isValid = false;
              // console.log('masuk-' + i);
            } else {
              if (days_.length - 1 !== i) {
                days_.push({ ...day });
                isValid = false;
              }
              // console.log('masuk2-' + i);
            }
          });
          ot.push(this.formBuilder.group({
            openTime: [item.open_time.substring(0, 5), Validators.required],
            closedTime: [item.closed_time.substring(0, 5), Validators.required],
            days: [days_]
          }));
          return { ...item, days: days_ }
        })
      }

      if (value.businesses.closed_start_date && value.businesses.closed_end_date)
        this.formLiburToko.get('isLibur').setValue(true);
      if (value.businesses.closed_start_date) {
        let startTime = value.businesses.closed_start_date.substring(value.businesses.closed_start_date.length - 8, value.businesses.closed_start_date.length - 3);
        this.formLiburToko.get('from').setValue(moment(value.businesses.closed_start_date).format('YYYY-MM-DD'));
        this.formLiburToko.get('fromTime').setValue(startTime);
      } else { this.formLiburToko.get('fromTime').setValue('00:00'); }
      if (value.businesses.closed_end_date) {
        let endTime = value.businesses.closed_end_date.substring(value.businesses.closed_end_date.length - 8, value.businesses.closed_end_date.length - 3);
        this.formLiburToko.get('to').setValue(moment(value.businesses.closed_end_date).format('YYYY-MM-DD'));
        this.formLiburToko.get('toTime').setValue(endTime);
      } else { this.formLiburToko.get('toTime').setValue('23:59'); }
      this.formLiburToko.get('leaveMessage').setValue(value.businesses.closed_message);
    });
  }

  initGMap() {
    const mapProp = {
      center: new google.maps.LatLng(-6.1798839, 106.8237044),
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    const markerImage = {
      url: '/assets/images/ayo/maps32.png',
      size: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 35)
    };
    try {
      setTimeout(() => {
        // console.log(this.permission)
        this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
        this.marker = new google.maps.Marker({
          position: new google.maps.LatLng(-6.1798839, 106.8237044),
          draggable: this.permissionLokasiToko ? this.permissionLokasiToko.ubah ? true : false : false,
          animation: google.maps.Animation.BOUNCE,
          map: this.map,
          icon: markerImage
        });
        this.initMapMarkerListener();
        if (this.profile.businesses[0].delivery_latitude !== null) {
          var pos = {
            lat: Number(this.profile.businesses[0].delivery_latitude),
            lng: Number(this.profile.businesses[0].delivery_longitude)
          };
          // console.log('this.profile ', pos );
          this.marker.setPosition(pos);
          this.setMapToCenter(pos.lat, pos.lng);
          this.gLocation(pos);
        }
        this.isMap = true;
      }, 1500);
    } catch (ex) {
      console.log('failed to initialize maps', ex);
      setTimeout(() => {
        this.initGMap();
      }, 1000);
    }
  }

  initMapMarkerListener() {
    this.map.addListener('mouseout', () => {
      this.map.setCenter(this.marker.getPosition());
      this.map.setZoom(14);
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
    });

    this.map.addListener('dragend', (item) => {
      const latLng = this.marker.getPosition();
      if (this.permissionLokasiToko.ubah) {
        this.formLokasiToko.get('latitude').setValue(latLng.lat());
        this.formLokasiToko.get('longitude').setValue(latLng.lng());
      }
    });

    this.marker.addListener('click', () => {
      this.toggleBounce();
    });

    this.marker.addListener('mouseup', (item) => {
      // console.log('ok', item.latLng)
      const latLng = this.marker.getPosition();
      if (this.permissionLokasiToko.ubah) {
        if (Number(this.profile.businesses[0].delivery_latitude) !== latLng.lat()) {
          this.formLokasiToko.get('latitude').setValue(latLng.lat());
          this.formLokasiToko.get('longitude').setValue(latLng.lng());
          this.gLocation(latLng);
        }
      }
    });

    this.marker.addListener('mouseover', (item) => {
      this.marker.setAnimation(null);
    });
  }

  setMapToCenter(lat: any, lng: any) {
    if (this.map !== null && this.map !== undefined) {
      if ((lat !== null && lat !== undefined) || (lng !== null && lng !== undefined)) {
        this.map.setCenter(new google.maps.LatLng(lat, lng));
      } else {
        console.log('location point tidak ditemukan')
      }
    }
  }

  toggleBounce() {
    if (this.marker.getAnimation() !== null) {
      this.marker.setAnimation(null);
    } else {
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

  gLocation(latLng: any) {
    this.geolocation.geocode({ location: latLng }, (resp) => {
      // console.log('resp', resp);
      if (resp && resp.length > 0) {
        this.formLokasiToko.get('alamatToko').setValue(resp[0].formatted_address);
      } else {
        this.dialogService.openSnackBar({ message: 'Cannot determine address at this location.' })
        this.formLokasiToko.get('alamatToko').setValue('');
        this.marker.setPosition(new google.maps.LatLng(-6.1798839, 106.8237044));
      }
    });
  }

  deleteSchedule(item: any, index: number) {
    // console.log('item-' + index, item);
    this.listSchedule.splice(index, 1);
    // console.log('this.listSchedule' , this.listSchedule); 
    const ot = this.formOperationalTimeGroup.get('formOperationalTime') as FormArray;
    ot.removeAt(index);
  }

  addSchedule() {
    // console.log('this.listSchedule' , this.listSchedule);
    let ot = this.formOperationalTimeGroup.get('formOperationalTime') as FormArray;
    if (this.listSchedule.length > 0) {
      this.listSchedule.push({
        open_time: '00:00',
        closed_time: '23:59',
        days: this.listDays
      });
      ot.push(this.formBuilder.group({
        openTime: ['00:00', Validators.required],
        closedTime: ['23:59', Validators.required],
        days: [this.listDays]
      }));
    } else {
      this.listSchedule = [{
        open_time: '00:00',
        closed_time: '23:59',
        days: this.listDays
      }];
      ot.push(this.formBuilder.group({
        openTime: ['00:00', Validators.required],
        closedTime: ['23:59', Validators.required],
        days: [this.listDays]
      }));
    }
    // console.log('OT', ot.getRawValue())
  }

  async checkIrisanTime(indexParent: number,) {
    return new Promise(async (resolved, rejected) => {
      let ot = this.formOperationalTimeGroup.getRawValue();
      const optIndex = parseInt(ot.formOperationalTime[indexParent].openTime);
      let cltIndex = parseInt(ot.formOperationalTime[indexParent].closedTime);
      if (cltIndex == 0) cltIndex = 2400;
      let isDuplicateDay = false;
      const x = this.listSchedule.map((item) => ({ ...item }));
      await x.map((item, i) => {
        const d = item.days.map((v) => ({ ...v }));
        d.map((val: any, j: number) => {
          // console.log('d', val)
          if (val.isActive && indexParent !== i) {
            // console.log('Jam Pada Hari [' + val.day_name + '] Beririsan')
            isDuplicateDay = true;
          }
        });
      });

      if (isDuplicateDay) {
        // console.log('isDuplicateDay1')
        await ot.formOperationalTime.map((otval) => {
          const opt = parseInt(otval.openTime);
          let clt = parseInt(otval.closedTime);
          if (clt == 0) clt = 2400;
          if ((optIndex < clt && optIndex > opt) || (cltIndex < clt && cltIndex > opt) || (optIndex < opt && cltIndex > clt) || (optIndex == opt && cltIndex == clt) || (optIndex == opt && cltIndex > clt) || (optIndex < opt && cltIndex == clt)) {
            // console.log('isDuplicateDay2')
            this.isSlicedOT = true;
            // resolved(true);
          }
        })
        if (this.isSlicedOT) {
          this.dialogService.openSnackBar({ message: "Waktu Operasional beririsan!" });
        } else {
          this.isSlicedOT = false
        }
        resolved(false);
      } else {
        resolved(false);
      }
      // console.log('this.listSchedule', this.listSchedule)
    });
  }

  async checkIrisan(indexParent: number, indexChild: number) {
    return new Promise(async (resolved, rejected) => {
      let ot = this.formOperationalTimeGroup.getRawValue();
      // let optIndex = parseInt(ot.formOperationalTime[indexParent].openTime);
      // let cltIndex = parseInt(ot.formOperationalTime[indexParent].closedTime);
      let optIndex = moment.duration(ot.formOperationalTime[indexParent].openTime).asHours();
      let cltIndex = moment.duration(ot.formOperationalTime[indexParent].closedTime).asHours();
      let i_index = -1;
      if (optIndex >= 2400) optIndex = 0;
      if (cltIndex == 0) cltIndex = 2400;
      let isDuplicateDay = false;
      const x = this.listSchedule.map((item) => ({ ...item }));
      await x.map((item, i) => {
        const d = item.days.map((v) => ({ ...v }));
        d.map((val: any, j: number) => {
          // console.log('d', val)
          if (val.isActive && indexParent !== i && indexChild == j) {
            // console.log('isDuplicateDay1'+ j, val.isActive)
            isDuplicateDay = true;
            i_index = i;
          }
        });
      });
      // console.log('isDuplicateDay');
      if (isDuplicateDay) {
        // console.log('isDuplicateDay1')
        await ot.formOperationalTime.map((otval, idx) => {
          // let opt = parseInt(otval.openTime);
          // let clt = parseInt(otval.closedTime);
          let opt = moment.duration(otval.openTime).asHours();
          let clt = moment.duration(otval.closedTime).asHours();
          if (opt >= 2400) opt = 0;
          if (clt == 0) clt = 2400;
          if (i_index == idx) {
            if ((optIndex < clt && optIndex > opt) || (cltIndex < clt && cltIndex > opt) || (optIndex < opt && cltIndex > clt) || (optIndex == opt && cltIndex == clt) || (optIndex == opt && cltIndex > clt) || (optIndex < opt && cltIndex == clt)) {
              // console.log('isDuplicateDay2')
              // console.log('optIndex: '+ optIndex + '- cltIndex: ', cltIndex);
              // console.log('opt: '+ opt + '- clt: ', clt);
              this.isSlicedOT = true;
              resolved(true);
            }
          }
        })
        resolved(false);
      } else {
        resolved(false);
      }
      // console.log('this.listSchedule', this.listSchedule)
    });
  }

  timeIsClick() {
    if (this.permissionOperasionalToko.ubah) {
      this.dialogService.openSnackBar({ message: "Non Aktifkan semua hari di samping untuk mengubah jam." });
    }
  }

  timesUp: boolean = false;
  addDayToSchedule_(indexParent: number, indexChild: number) {
    if (this.permissionOperasionalToko.ubah) {
      if (!this.timesUp) {
        this.timesUp = true;
        this.checkIrisan(indexParent, indexChild).then((value) => {
          if (!value) {
            // console.log('isDuplicateDay',value)
            let ot = this.formOperationalTimeGroup.getRawValue();
            const optIndex = parseInt(ot.formOperationalTime[indexParent].openTime);
            let cltIndex = parseInt(ot.formOperationalTime[indexParent].closedTime);
            if (optIndex !== cltIndex) {
              this.addDayToSchedule_(indexParent, indexChild);
            } else {
              this.dialogService.openSnackBar({ message: "Atur Ulang Jam Buka dan Jam Tutup Operasional!" });
            }
          } else {
            if (this.listSchedule[indexParent].days[indexChild].isActive) {
              this.listSchedule.map((item, i) => {
                const d = item.days.map((v) => ({ ...v }));
                let ot = this.formOperationalTimeGroup.get('formOperationalTime') as FormArray;
                if (i === indexParent) {
                  d.map((val, j) => {
                    if (j === indexChild) val.isActive = false;
                    return ({ ...val });
                  });
                  item.days = d;
                  ot.at(indexParent).get('days').setValue(d);
                };
                return ({ ...item });
              })
            } else {
              this.dialogService.openSnackBar({ message: "Waktu Operasional beririsan!" });
            }
          }
        });
        setTimeout(() => {
          this.timesUp = false;
        }, 300);
      } else {
        // console.log('jangan melakukan perubahan terlalu cepat')
        this.dialogService.openSnackBar({ message: "Jangan melakukan perubahan terlalu cepat!" });
      }
    } else {
      console.log('anda tidak memiliki akses ubah untuk fitur ini');
    }
  }

  addDayToSchedule(indexParent: number, indexChild: number) {
    if (this.listSchedule[indexParent].days[indexChild].isActive)
      this.listSchedule.map((item, i) => {
        const d = item.days.map((v) => ({ ...v }));
        let ot = this.formOperationalTimeGroup.get('formOperationalTime') as FormArray;
        if (i === indexParent) {
          d.map((val, j) => {
            if (j === indexChild) val.isActive = false;
            return ({ ...val });
          });
          item.days = d;
          ot.at(indexParent).get('days').setValue(d);
        };
        return ({ ...item });
      })
    else
      this.listSchedule.map((item, i) => {
        const d = item.days.map((v) => ({ ...v }));
        let ot = this.formOperationalTimeGroup.get('formOperationalTime') as FormArray;
        if (i === indexParent) {
          d.map((val, j) => {
            if (j === indexChild) val.isActive = true;
            return ({ ...val });
          });
          item.days = d;
          ot.at(indexParent).get('days').setValue(d);
        };
        return ({ ...item });
      })
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }
    return "";
  }

  setMinDate(param?: any): void {
    this.formLiburToko.get("to").setValue("");
    this.minDate = param;
  }

  setCurrentLocation() {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // this.infoWindow.setPosition(pos);
        // this.infoWindow.setContent('Location found.');
        // this.infoWindow.open(this.map);
        this.map.setCenter(pos);
        this.marker.setPosition(pos);
        this.formLokasiToko.get('latitude').setValue(pos.lat);
        this.formLokasiToko.get('longitude').setValue(pos.lng);
        this.gLocation(this.marker.getPosition());
      }, () => {
        this.handleLocationError(true, this.infoWindow, this.map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      this.handleLocationError(false, this.infoWindow, this.map.getCenter());
    }
  }

  handleLocationError(browserHasGeolocation, infoWindow, pos) {
    // infoWindow.setPosition(pos);
    // infoWindow.setContent(browserHasGeolocation ?
    //                       'Error: The Geolocation service failed.' :
    //                       'Error: Your browser doesn\'t support geolocation.');
    // infoWindow.open(this.map);

    this.dialogService.openSnackBar({
      message: browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.'
    });
  }

}
