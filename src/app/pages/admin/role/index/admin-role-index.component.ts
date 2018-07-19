import { Component,ViewChild,TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';




@Component({
    selector   : 'admin-role-index',
    templateUrl: './admin-role-index.component.html',
    styleUrls  : ['./admin-role-index.component.scss']
})
export class AdminRoleIndexComponent
{
	rows: any[];
    loadingIndicator = true;
    reorderable = true;
    @ViewChild('activeCell')
    activeCellTemp: TemplateRef<any>;
    constructor(private http:HttpClient)
    {
        
    }

    ngOnInit(){
    	this.http.get('api/admin_user')
            .subscribe((admin_user: any) => {
                this.rows = admin_user;
                this.loadingIndicator = false;
            });
    }

    getActives(){
    	return this.rows.map((row) => row['active_status'] );
    }
}
