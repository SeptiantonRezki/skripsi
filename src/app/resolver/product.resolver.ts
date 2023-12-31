import { Injectable } from "../../../node_modules/@angular/core";
import { Resolve } from "../../../node_modules/@angular/router";
import { ProductService } from "../services/sku-management/product.service";
import { Observable } from "../../../node_modules/rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class ListBrandResolver implements Resolve<any> {
  constructor(private productService: ProductService) { }
  resolve(): Observable<any> {
    return this.productService.getListBrand()
      .pipe(
        map(res => res),
        catchError(err => err)
      );
  }
}

@Injectable()
export class ListCategoryResolver implements Resolve<any> {
  constructor(private productService: ProductService) { }
  resolve(): Observable<any> {
    return this.productService.getListCategory(null);
  }
}

@Injectable()
export class ListPackagingResolver implements Resolve<any> {
  constructor(private productService: ProductService) { }
  resolve(): Observable<any> {
    return this.productService.getListPackaging();
  }
}
