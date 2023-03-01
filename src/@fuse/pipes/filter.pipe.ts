import { Pipe, PipeTransform } from "@angular/core";
import { FuseUtils } from "@fuse/utils";
import moment from 'moment';

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

@Pipe({name: "excludeArray"})
export class ExcludeArrayPipe implements PipeTransform {
  transform(target: any[], toRemove: any[]): any {
    console.log({target, toRemove});
    const result = target.filter((item) => !toRemove.includes(item))
    console.log({result});
    return result;
  }
}

@Pipe({name: "dateRange"})
export class DateRangePipe implements PipeTransform {

  transform(value: number, ...args: any[]) {
      
    const format = args.length ? args[0] : null;
      const defaultValue = args.length > 1 ? args[1] : '';
      const isRaw = args.length > 2 ? args[2] : false;

      if(value === 0) return defaultValue;

      const date = moment();
      const from = moment(date).subtract(value, 'd').format(format);
      const now = moment().format(format);
      const result = isRaw ? {from, to: now} : `${from} - ${now}`;
      
      return result;
  }
}
