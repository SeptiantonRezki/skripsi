import { Component, ViewChild } from "@angular/core";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";

@Component({
  selector: "app-template-create",
  templateUrl: "./template-create.component.html",
  styleUrls: ["./template-create.component.scss"]
})
export class TemplateCreateComponent {
  public dataTemplateTask: {
    name: string;
    description: string;
    material: Boolean;
    material_description: string;
    questions: Array<any>;
  };

  listChoose: any = [
    { name: "Jawaban Singkat", value: "text", icon: "short_text" },
    { name: "Paragraf", value: "textarea", icon: "notes" },
    { name: "Pilihan Ganda", value: "radio", icon: "radio_button_checked" },
    { name: "Kotak Centang", value: "checkbox", icon: "check_box" }
  ];

  @ViewChild("autosize")
  autosize: CdkTextareaAutosize;

  constructor() {}

  ngOnInit() {
    this.dataTemplateTask = {
      name: "Judul Tugas",
      description: "Deskripsi Tugas",
      material: false,
      material_description: "Deskripsi Tugas Material",
      questions: []
      // questions: { name: "Kotak Centang", value: "check_box", icon: "check_box" }
    };
  }

  addAdditional(idx) {
    // console.log(this.dataTemplateTask.questions[idx].additional.push('Opsi 2'))
    this.dataTemplateTask.questions[idx].additional.push(`Opsi ${this.dataTemplateTask.questions[idx].additional.length + 1}`);
  }

  defaultValue(event?, type?, text?) {
    if (event.target.value === "") {
      this.dataTemplateTask[type] = text;
    }
  }

  changeType(item, idx?) {
    console.log(item, idx)
  }

  addQuestion(): void {
    this.dataTemplateTask.questions.splice(1, 0, { 
      question: `Pertanyaan ${this.dataTemplateTask.questions.length + 1}`,
      type: { 
        name: "Pilihan Ganda", 
        value: "radio", 
        icon: "radio_button_checked" 
      }, 
      additional: ['Opsi 1'], 
      questionimage: null, 
      others: false,
      required: false
    })
  }

  addOthers(idx): void {
    this.dataTemplateTask.questions[idx].others = !this.dataTemplateTask.questions[idx].others;
  }

  deleteQuestion(idx): void {
    this.dataTemplateTask.questions.splice(idx, 1);
  }

  deleteAdditional(idx1?, idx2?): void {
    this.dataTemplateTask.questions[idx1].additional.splice(idx2, 1);
  }

  customTrackBy(index: number, value: number) {
    return index;
  }
}
