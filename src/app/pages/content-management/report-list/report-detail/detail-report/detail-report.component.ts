import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-detail-report',
  templateUrl: './detail-report.component.html',
  styleUrls: ['./detail-report.component.scss']
})
export class DetailReportComponent implements OnInit {
  formPromo: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.formPromo = this.formBuilder.group({
      user: ["Wholesaler"],
      promotionType: ["Undian"],
      title: ["Gebyar Poin ibu imah"],
      description: ["Saatnya belanja dapet poin"],
      promotionDetail: ["Lorem ipsum dolor sit amet."],
      promoCreatedDate: [new Date()],
      promoExpiredDate: [new Date()]
    });

    this.formPromo.disable();
  }

}
