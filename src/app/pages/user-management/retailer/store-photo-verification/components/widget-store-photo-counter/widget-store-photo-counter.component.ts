import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StorePhotoVerificationService } from 'app/services/store-photo-verification.service';

@Component({
  selector: 'widget-store-photo-counter',
  templateUrl: './widget-store-photo-counter.component.html',
  styleUrls: ['./widget-store-photo-counter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WidgetStorePhotoCounterComponent implements OnInit {
  
  loading: boolean = true;
  uploading: number = 0;
  uploaded: number = 0;
  verified: number = 0;

  constructor(
    private storePhotoVerificationService: StorePhotoVerificationService
  ) {
  }

  ngOnInit() {
    this.storePhotoVerificationService.getCalculationResult().subscribe(({data}) => {
    
      this.uploading = data['total-retailer-upload'];
      this.uploaded = data['total-foto-terupload'];
      this.verified = data['total-foto-terverifikasi'];
    
    }, (error) => {
      
    }, () => {
      this.loading = false;
    })
  }

}
