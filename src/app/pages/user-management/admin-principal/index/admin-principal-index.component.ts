import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-principal-index',
  templateUrl: './admin-principal-index.component.html',
  styleUrls: ['./admin-principal-index.component.scss']
})
export class AdminPrincipalIndexComponent implements OnInit {

  rows: any[];
    loadingIndicator = true;
    reorderable = true;
    constructor(private http: HttpClient)
    {
    	
        
    }

  ngOnInit() {
  	this.http.get('api/contacts-contacts')
            .subscribe((contacts: any) => {
                this.rows = contacts;
                this.loadingIndicator = false;
            });
  }

}
