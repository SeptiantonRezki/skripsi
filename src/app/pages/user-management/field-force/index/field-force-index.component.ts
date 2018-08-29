import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-field-force-index',
  templateUrl: './field-force-index.component.html',
  styleUrls: ['./field-force-index.component.scss']
})
export class FieldForceIndexComponent implements OnInit {

  rows: any[];
	loadingIndicator = true;
	reorderable = true;
	constructor(private http: HttpClient){
		
	    
	}

	ngOnInit() {
		this.http.get('api/contacts-contacts')
          .subscribe((contacts: any) => {
              this.rows = contacts;
              this.loadingIndicator = false;
          });
	}

}
