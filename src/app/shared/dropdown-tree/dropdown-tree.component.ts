import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MatSelectChange } from "../../../../node_modules/@angular/material";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: "dropdown-form",
  templateUrl: "./dropdown-tree.component.html",
  styleUrls: ["./dropdown-tree.component.scss"]
})
export class DropdownTreeComponent {
  formControls = {};
  _dataCb;

  @Input()
  dataCb: any;

  @Input()
  dataPlaceholder: any;

  @Input()
  form: FormGroup;

  @Output()
  selectionChange = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {
    // this.fieldProps.map(prop => {
    // this.formControls[prop] =
    // console.log(prop);
    // })
  }

  ngOnInit() {}

  change(event?: MatSelectChange, index?: Number) {
    this.selectionChange.emit({ event, index });
  }
}
