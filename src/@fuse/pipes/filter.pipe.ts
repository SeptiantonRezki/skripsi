import { Pipe, PipeTransform } from "@angular/core";
import { FuseUtils } from "@fuse/utils";
import * as moment from "moment";

@Pipe({ name: "filter" })
export class FilterPipe implements PipeTransform {
  transform(mainArr: any[], searchText: string, property: string): any {
    return FuseUtils.filterArrayByString(mainArr, searchText);
  }
}

@Pipe({
  name: "dateToMoment"
})
export class DateToMomentPipe implements PipeTransform {
  transform(value: any, param: any) {
    moment.locale("id");

    if (!value) {
      return "";
    }

    if (param) {
      return moment(value).format(param);
    }

    return moment(value).format("D MMMM YYYY");
  }
}
