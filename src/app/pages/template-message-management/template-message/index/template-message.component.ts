import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TemplateMessageService } from 'app/services/template-message-management/template-message.service';
import { Validators, FormBuilder, FormGroup } from "@angular/forms";

const defaultTemplateWholesaler = [
  {
    "id": 1,
    "title": "Hai, selamat datang di toko kami! Apakah ada informasi yang dapat kami berikan?",
    "body": "Hai, selamat datang di toko kami! Apakah ada informasi yang dapat kami berikan?",
    "user": "wholesaler"
  },
  {
    "id": 2,
    "title": "Pesanan Anda masih dalam proses untuk disiapkan.",
    "body": "Pesanan Anda masih dalam proses untuk disiapkan.",
    "user": "wholesaler"
  },
  {
    "id": 3,
    "title": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
    "body": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
    "user": "wholesaler"
  },
  {
    "id": 4,
    "title": "Apakah pesanannya sudah diterima? Jika sudah, mohon untuk lakukan konfirmasi penerimaan (tekan Pesanan Diterima)",
    "body": "Apakah pesanannya sudah diterima? Jika sudah, mohon untuk lakukan konfirmasi penerimaan (tekan Pesanan Diterima)",
    "user": "wholesaler"
  },
  {
    "id": 5,
    "title": "Terima kasih telah berbelanja di toko kami. Semoga pengalaman berbelanja Anda menyenangkan!",
    "body": "Terima kasih telah berbelanja di toko kami. Semoga pengalaman berbelanja Anda menyenangkan!\n\nSilahkan sampaikan kritik dan saran agar kami dapat melayani Anda lebih baik lagi.",
    "user": "wholesaler"
  }
];
const defaultTemplateRetailer = [
  {
    "id": 6,
    "title": "Hai, pesanan saya sudah diproses sampai mana?",
    "body": "Hai, pesanan saya sudah diproses sampai mana?",
    "user": "retailer"
  },
  {
    "id": 7,
    "title": "Mohon info, kapan pesanan saya akan dikirim?",
    "body": "Mohon info, kapan pesanan saya akan dikirim?",
    "user": "retailer"
  },
  {
    "id": 8,
    "title": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
    "body": "Mohon maaf ada perubahan pada pesanan Anda, apakah bisa dilakukan konfirmasi (tekan Setuju)?",
    "user": "retailer"
  },
  {
    "id": 9,
    "title": "Apakah pesanan saya jumlah dan harganya sesuai dengan yang saya pesan diaplikasi?",
    "body": "Apakah pesanan saya jumlah dan harganya sesuai dengan yang saya pesan diaplikasi?",
    "user": "retailer"
  },
  {
    "id": 10,
    "title": "Terima kasih!",
    "body": "Terima kasih!",
    "user": "retailer"
  }
];
const defaultTemplateWholesalerCambodia = [
  {
    "id": 1,
    "title": "សួស្តី ស្វាគមន៍មកកាន់ហាងយើងខ្ញុំ! តើមានព័ត៌មានដែលយើងអាចផ្តល់បានទេ?",
    "body": "សួស្តី ស្វាគមន៍មកកាន់ហាងយើងខ្ញុំ! តើមានព័ត៌មានដែលយើងអាចផ្តល់បានទេ?",
    "user": "wholesaler"
  },
  {
    "id": 2,
    "title": "ការបញ្ជាទិញរបស់អ្នកនៅតែស្ថិតក្នុងដំណើរការរៀបចំ។",
    "body": "ការបញ្ជាទិញរបស់អ្នកនៅតែស្ថិតក្នុងដំណើរការរៀបចំ។",
    "user": "wholesaler"
  },
  {
    "id": 3,
    "title": "សូមអភ័យទោស មានការផ្លាស់ប្តូរនៅក្នុងការបញ្ជាទិញរបស់អ្នក តើវាអាចត្រូវបានបញ្ជាក់ (ចុចយល់ព្រម) បានទេ?",
    "body": "សូមអភ័យទោស មានការផ្លាស់ប្តូរនៅក្នុងការបញ្ជាទិញរបស់អ្នក តើវាអាចត្រូវបានបញ្ជាក់ (ចុចយល់ព្រម) បានទេ?",
    "user": "wholesaler"
  },
  {
    "id": 4,
    "title": "បានទទួលការបញ្ជាទិញហើយឬនៅ? បើដូច្នេះមែន សូមបញ្ជាក់ការទទួល (ចុច Order Received)",
    "body": "បានទទួលការបញ្ជាទិញហើយឬនៅ? បើដូច្នេះមែន សូមបញ្ជាក់ការទទួល (ចុច Order Received)",
    "user": "wholesaler"
  },
  {
    "id": 5,
    "title": "អរគុណសម្រាប់ការទិញនៅហាងយើងខ្ញុំ។ មានបទពិសោធន៍ទិញទំនិញដ៏ល្អ!",
    "body": "អរគុណសម្រាប់ការទិញនៅហាងយើងខ្ញុំ។ មានបទពិសោធន៍ទិញទំនិញដ៏ល្អ!\n\nសូមដាក់ការរិះគន់ និងយោបល់ ដើម្បីយើងអាចបម្រើអ្នកបានកាន់តែប្រសើរ។",
    "user": "wholesaler"
  }
];
const defaultTemplateRetailerCambodia = [
  {
    "id": 6,
    "title": "សួស្តី តើការបញ្ជាទិញរបស់ខ្ញុំដំណើរការដល់កម្រិតណា?",
    "body": "សួស្តី តើការបញ្ជាទិញរបស់ខ្ញុំដំណើរការដល់កម្រិតណា?",
    "user": "retailer"
  },
  {
    "id": 7,
    "title": "សូមប្រាប់ខ្ញុំផង តើការបញ្ជាទិញរបស់ខ្ញុំនឹងត្រូវដឹកជញ្ជូននៅពេលណា?",
    "body": "សូមប្រាប់ខ្ញុំផង តើការបញ្ជាទិញរបស់ខ្ញុំនឹងត្រូវដឹកជញ្ជូននៅពេលណា?",
    "user": "retailer"
  },
  {
    "id": 8,
    "title": "សូមអភ័យទោស មានការផ្លាស់ប្តូរនៅក្នុងការបញ្ជាទិញរបស់អ្នក តើវាអាចត្រូវបានបញ្ជាក់ (ចុចយល់ព្រម) បានទេ?",
    "body": "សូមអភ័យទោស មានការផ្លាស់ប្តូរនៅក្នុងការបញ្ជាទិញរបស់អ្នក តើវាអាចត្រូវបានបញ្ជាក់ (ចុចយល់ព្រម) បានទេ?",
    "user": "retailer"
  },
  {
    "id": 9,
    "title": "តើចំនួនការបញ្ជាទិញ និងតម្លៃរបស់ខ្ញុំត្រូវនឹងអ្វីដែលខ្ញុំបានបញ្ជាទិញក្នុងកម្មវិធីឬ?",
    "body": "តើចំនួនការបញ្ជាទិញ និងតម្លៃរបស់ខ្ញុំត្រូវនឹងអ្វីដែលខ្ញុំបានបញ្ជាទិញក្នុងកម្មវិធីឬ?",
    "user": "retailer"
  },
  {
    "id": 10,
    "title": "សូមអរគុណ!",
    "body": "សូមអរគុណ!",
    "user": "retailer"
  }
];
const defaultTemplateWholesalerPhili = [
  {
    "id": 1,
    "title": "Hi, welcome to our shop! Is there any information we can provide?",
    "body": "Hi, welcome to our shop! Is there any information we can provide?",
    "user": "wholesaler"
  },
  {
    "id": 2,
    "title": "Your order is still in the process of being prepared.",
    "body": "Your order is still in the process of being prepared.",
    "user": "wholesaler"
  },
  {
    "id": 3,
    "title": "Sorry, there has been a change in your order, can it be confirmed (press Agree)?",
    "body": "Sorry, there has been a change in your order, can it be confirmed (press Agree)?",
    "user": "wholesaler"
  },
  {
    "id": 4,
    "title": "Has the order been received? If so, please confirm receipt (press Order Received)",
    "body": "Has the order been received? If so, please confirm receipt (press Order Received)",
    "user": "wholesaler"
  },
  {
    "id": 5,
    "title": "Thank you for buying in our shop. Have a nice shopping experience!",
    "body": "Thank you for buying in our shop. Have a nice shopping experience!\n\nPlease submit criticism and suggestions so that we can serve you better.",
    "user": "wholesaler"
  }
];
const defaultTemplateRetailerPhili = [
  {
    "id": 6,
    "title": "Hi, how far has my order been processed?",
    "body": "Hi, how far has my order been processed?",
    "user": "retailer"
  },
  {
    "id": 7,
    "title": "Please let me know, when will my order be shipped?",
    "body": "Please let me know, when will my order be shipped?",
    "user": "retailer"
  },
  {
    "id": 8,
    "title": "Sorry, there has been a change in your order, can it be confirmed (press Agree)?",
    "body": "Sorry, there has been a change in your order, can it be confirmed (press Agree)?",
    "user": "retailer"
  },
  {
    "id": 9,
    "title": "Does my order amount and price match what I ordered in the application?",
    "body": "Does my order amount and price match what I ordered in the application?",
    "user": "retailer"
  },
  {
    "id": 10,
    "title": "Thank You!",
    "body": "Thank You!",
    "user": "retailer"
  }
];

const Pagevar = {
  "text": "Manajemen Template Pesan",
  "country": "Negara",
  "template_pesan": {
    "text1": "Template Pesan",  
    "text2": "Daftar Template Pesan",  
    "text3": "Reset To Default", 
    "text4": "Reset All To Default",
    "text5": "Judul Template Pesan",
    "text6": "Detail Template Pesan",
    "text7": "Judul atau Detail Template Pesan harus diisi!",
    "text8": "Menyimpan"
  }
};

const PagevarCam = {
  "text": "ការគ្រប់គ្រងគំរូសារ",
  "country": "ប្រទេស",
  "template_pesan": {
    "text1": "គំរូសារ",
    "text2": "ចុះឈ្មោះគំរូសារ",
    "text3": "កំណត់ឡើងវិញតាមលំនាំដើម",
    "text4": "កំណត់ឡើងវិញ",
    "text5": "ចំណងជើងគំរូសារ",
    "text6": "ព័ត៌មានលម្អិតអំពីគំរូសារ",
    "text7": "តម្រូវឱ្យមានចំណងជើងឬគំរូព័ត៌មានលម្អិត!",
    "text8": "រក្សាទុក" 
  }
};

const PagevarPhi = {
  "text": " Message Template Management",
  "country": "Country",
  "template_pesan": {
    "text1": "Message Template",
    "text2": "Register Message Template",
    "text3": "Reset to Default",
    "text4": "Reset All to Default",
    "text5": "Message Template Title",
    "text6": "Message Template Details",
    "text7": "Title or Message Template Details is required!",
    "text8": "Save" 
  }
};
const RPagevar = {
  "text": "Manajemen Template Pesan",
  "country": "Negara",
  "template_pesan": {
    "text1": "Template Pesan",  
    "text2": "Daftar Template Pesan",  
    "text3": "Reset To Default", 
    "text4": "Reset All To Default",
    "text5": "Judul Template Pesan",
    "text6": "Detail Template Pesan",
    "text7": "Judul atau Detail Template Pesan harus diisi!",
    "text8": "Menyimpan" 
  }
};

const RPagevarCam = {
  "text": "ការគ្រប់គ្រងគំរូសារ",
  "country": "ប្រទេស",
  "template_pesan": {
    "text1": "គំរូសារ",
    "text2": "ចុះឈ្មោះគំរូសារ",
    "text3": "កំណត់ឡើងវិញតាមលំនាំដើម",
    "text4": "កំណត់ឡើងវិញ",
    "text5": "ចំណងជើងគំរូសារ",
    "text6": "ព័ត៌មានលម្អិតអំពីគំរូសារ",
    "text7": "តម្រូវឱ្យមានចំណងជើងឬគំរូព័ត៌មានលម្អិត!",
    "text8": "រក្សាទុក"
  }
};

const RPagevarPhi = {
  "text": " Message Template Management",
  "country": "Country",
  "template_pesan": {
    "text1": "Message Template",
    "text2": "Register Message Template",
    "text3": "Reset to Default",
    "text4": "Reset All to Default",
    "text5": "Message Template Title",
    "text6": "Message Template Details",
    "text7": "Title or Message Template Details is required!",
    "text8": "Save"
  }
};

@Component({
  selector: 'app-template-message',
  templateUrl: './template-message.component.html',
  styleUrls: ['./template-message.component.scss']
})
export class TemplateMessageComponent {
  formTemplate: FormGroup;
  formTemplateR: FormGroup;
  onLoad: boolean;
  wholesalerTemplates: any;
  retailerTemplates: any;
  deleteListWholesaler: any;
  deleteListRetailer: any;
  public selected: any;
  indexOnEdit: number;
  listOnEdit: any;
  isSaved: boolean;
  selectedTab: number;
  WCountry: any;
  RCountry: any;
  RtCountry: any[];
  WsCountry: any[];
  PageVariable: any;
  RPageVariable: any;

  constructor(
    private formBuilder: FormBuilder,
    public tms: TemplateMessageService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.wholesalerTemplates = [];
    this.retailerTemplates = [];
    this.deleteListWholesaler = [];
    this.deleteListRetailer = [];
    this.indexOnEdit = -1;
    this.listOnEdit = [];
    this.isSaved = false;
    this.selectedTab = 0;
  }

  ngOnInit() {
    this.getCountry();
    
    
    this.formTemplate = this.formBuilder.group({
      country: [""]
    });
    this.formTemplateR = this.formBuilder.group({
      country: [""]
    });
    if(this.ls.selectedLanguages == 'id'){
      this.formTemplate.get('country').setValue('ID');
      this.formTemplateR.get('country').setValue('ID');
      this.PageVariable = Pagevar;
      this.RPageVariable = RPagevar;
    }
    else if(this.ls.selectedLanguages == 'km'){
      this.formTemplate.get('country').setValue('KH');
      this.formTemplateR.get('country').setValue('KH');
      this.PageVariable = PagevarCam;
      this.RPageVariable = RPagevarCam;
    }
    else if(this.ls.selectedLanguages == 'en-ph'){
      this.formTemplate.get('country').setValue('PH');
      this.formTemplateR.get('country').setValue('PH');
      this.PageVariable = PagevarPhi;
      this.RPageVariable = RPagevarPhi;
    }
    this.formTemplateR.controls['country'].disable();
      this.formTemplate.controls['country'].disable();
    this.tms.get().subscribe((res: any) => {
      this.wholesalerTemplates = res.data.wholesaler;
      this.retailerTemplates = res.data.retailer;
      // console.log(res.data.wholesaler[0].country, "res.data.wholesaler.country");
      
      if(res.data.country != null){
        this.formTemplate.get('country').setValue(res.data.country);
        
        if(this.formTemplate.get('country').value == 'ID'){
          this.PageVariable = Pagevar;
        }
        else if(this.formTemplate.get('country').value == 'KH'){
          this.PageVariable = PagevarCam;
        }
        else if(this.formTemplate.get('country').value == 'PH'){
          this.PageVariable = PagevarPhi;
        }
        //console.log("this.PageVariable.country", this.PageVariable.country);
      }
        
      if(res.data.country != null){
        this.formTemplateR.get('country').setValue(res.data.country);
        
        if(this.formTemplateR.get('country').value == 'ID'){
          this.RPageVariable = RPagevar;
        }
        else if(this.formTemplateR.get('country').value == 'KH'){
          this.RPageVariable = RPagevarCam;
        }
        else if(this.formTemplateR.get('country').value == 'PH'){
          this.RPageVariable = RPagevarPhi;
        }
        
        
      }

      if (res.data.wholesaler.length == 0) {
        // this.getCountry();
        if(this.formTemplate.get('country').value == 'ID'){
          this.wholesalerTemplates = defaultTemplateWholesaler;
        }
        else if(this.formTemplate.get('country').value == 'KH'){
          this.wholesalerTemplates = defaultTemplateWholesalerCambodia;
        }
        else if(this.formTemplate.get('country').value == 'PH'){
          this.wholesalerTemplates = defaultTemplateWholesalerPhili;
        }
        // this.wholesalerTemplates = defaultTemplateWholesaler;

      }
      if (res.data.retailer.length == 0) {
        // this.getCountry();
        if(this.formTemplateR.get('country').value == 'ID'){
          this.retailerTemplates = defaultTemplateRetailer;
        }
        else if(this.formTemplateR.get('country').value == 'KH'){
          this.retailerTemplates = defaultTemplateRetailerCambodia;
        }
        else if(this.formTemplateR.get('country').value == 'PH'){
          this.retailerTemplates = defaultTemplateRetailerPhili;
        }
        // this.retailerTemplates = defaultTemplateRetailer;

      }
      this.onLoad = false;
    }, error => {
      this.onLoad = false;
      alert(error);
    })

  }

  selectedTabChange(e: any) {
    // console.log(this.selectedTab + " - ",  e);
    this.indexOnEdit = -1;
    if (e !== this.selectedTab) {
      this.selectedTab = e;
    }
  }

  resetToDefault(index: number, user: string) {
    console.log('index', index);
    console.log('user', user);
    if (user == 'wholesaler') {
      if(this.formTemplate.get('country').value == 'ID'){
        this.wholesalerTemplates[index].title = defaultTemplateWholesaler[index].title;
        this.wholesalerTemplates[index].body = defaultTemplateWholesaler[index].body;
      }
      else if(this.formTemplate.get('country').value == 'KH'){
        this.wholesalerTemplates[index].title = defaultTemplateWholesalerCambodia[index].title;
        this.wholesalerTemplates[index].body = defaultTemplateWholesalerCambodia[index].body;
      }
      else if(this.formTemplate.get('country').value == 'PH'){
        this.wholesalerTemplates[index].title = defaultTemplateWholesalerPhili[index].title;
        this.wholesalerTemplates[index].body = defaultTemplateWholesalerPhili[index].body;
      }

    } else {
      if (user == 'retailer') {
        if(this.formTemplateR.get('country').value == 'ID'){
          this.retailerTemplates[index].title = defaultTemplateRetailer[index].title;
          this.retailerTemplates[index].body = defaultTemplateRetailer[index].body;
        }
        else if(this.formTemplateR.get('country').value == 'KH'){
          this.retailerTemplates[index].title = defaultTemplateRetailerCambodia[index].title;
          this.retailerTemplates[index].body = defaultTemplateRetailerCambodia[index].body;
        }
        else if(this.formTemplateR.get('country').value == 'PH'){
          this.retailerTemplates[index].title = defaultTemplateRetailerPhili[index].title;
          this.retailerTemplates[index].body = defaultTemplateRetailerPhili[index].body;
        }
        
      }
    }
  }


  resetToDefaultAll(user: string) {
    if (user == 'wholesaler') {
      const match = [...this.deleteListWholesaler, ...this.wholesalerTemplates]
      this.deleteListWholesaler = match.reduce((a, c) => { !a.find(v => v.id === c.id) && a.push(c); return a; }, []);
      if(this.formTemplate.get('country').value == 'ID'){
        this.wholesalerTemplates = defaultTemplateWholesaler.map(item => ({ ...item }));
      }
      else if(this.formTemplate.get('country').value == 'KH'){
        this.wholesalerTemplates = defaultTemplateWholesalerCambodia.map(item => ({ ...item }));
      }
      else if(this.formTemplate.get('country').value == 'PH'){
        this.wholesalerTemplates = defaultTemplateWholesalerPhili.map(item => ({ ...item }));
      }
      
    } else {
      if (user == 'retailer') {
        const match = [...this.deleteListRetailer, ...this.retailerTemplates]
        this.deleteListRetailer = match.reduce((a, c) => { !a.find(v => v.id === c.id) && a.push(c); return a; }, []);
        if(this.formTemplateR.get('country').value == 'ID'){
          this.retailerTemplates = defaultTemplateRetailer.map(item => ({ ...item }));
        }
        else if(this.formTemplateR.get('country').value == 'KH'){
          this.retailerTemplates = defaultTemplateRetailerCambodia.map(item => ({ ...item }));
        }
        else if(this.formTemplateR.get('country').value == 'PH'){
          this.retailerTemplates = defaultTemplateRetailerPhili.map(item => ({ ...item }));
        }
        
      }
    }
  }

  addTemplate(user: string) {
    let newTemplate = {
      body: "",
      created_at: "",
      id: "",
      title: "",
      updated_at: "",
      user: user,
    }
    if (user == 'wholesaler') {
      if (this.wholesalerTemplates.length < 5) {
        let indexOnEmpty = [];
        let wt = this.wholesalerTemplates.map((item: any, i: number) => {
          if (item.body == "" || item.title == "") {
            indexOnEmpty.push(i + 1);
          }
          return item;
        });
        Promise.all(wt).then(() => {
          if (indexOnEmpty.length > 0) {
            alert("Judul atau Isi Template Pesan " + JSON.stringify(indexOnEmpty) + " harus diisi!");
          } else {
            this.wholesalerTemplates.push(newTemplate);
            this.listOnEdit.push(newTemplate);
          }
        });
      } else {
        alert("Jumlah Template Telah Mencapai Batas Maksimal (5).")
      }
    }
    if (user == 'retailer') {
      if (this.retailerTemplates.length < 5) {
        let indexOnEmpty = [];
        let wt = this.retailerTemplates.map((item: any, i: number) => {
          if (item.body == "" || item.title == "") {
            indexOnEmpty.push(i + 1);
          }
          return item;
        });
        Promise.all(wt).then(() => {
          if (indexOnEmpty.length > 0) {
            alert("Judul atau Isi Template Pesan " + JSON.stringify(indexOnEmpty) + " harus diisi!");
          } else {
            this.retailerTemplates.push(newTemplate);
            this.listOnEdit.push(newTemplate);
          }
        });
      } else {
        alert("Jumlah Template Telah Mencapai Batas Maksimal (5).")
      }
    }
  }

  onEdit(item: any, i: number, user: string) {
    if (this.indexOnEdit == i) this.indexOnEdit = -1;
    else this.indexOnEdit = i;

  }

  onBlur(item: any, i: number, user: string) {
    if (this.indexOnEdit == i) this.indexOnEdit = -1;
  }

  onDeleteTemplate(item: any, i: number, user: string) {
    if (user == 'wholesaler') {
      this.wholesalerTemplates.splice(i, 1);
      if (item.id !== '')
        this.deleteListWholesaler.push(item);
    }
    if (user == 'retailer') {
      this.retailerTemplates.splice(i, 1);
      if (item.id !== '')
        this.deleteListRetailer.push(item);
    }
  }

  async deleteTemplates(body: FormData, user: string) {
    return await this.tms.delete(body).subscribe((res) => {
      console.log('deleted');
      if (user == "wholesaler") this.deleteListWholesaler = [];
      if (user == "retailer") this.deleteListRetailer = [];
      this.onSaveTemplate(user);
    }, error => {
      console.log('delete failed', error);
      alert('Failed to Save Template')
    });
  }

  async onSaveTemplate(user: string) {
    let error = false;
    let error2 = false;
    this.indexOnEdit = -1;
    let bodySave = new FormData();
    let bodyDelete = new FormData();
    if (user == "wholesaler") {
      console.log('this.deleteListWholesaler', this.deleteListWholesaler)
      if (this.deleteListWholesaler.length > 0) {
        let deleteReady = await this.deleteListWholesaler.map((item: any, i: number) => {
          bodyDelete.append('ids[' + i + ']', item.id);
        });
        await Promise.all(deleteReady).then(async () => {
          await this.deleteTemplates(bodyDelete, user);
        });
      } else {
        let templateReady = await this.wholesalerTemplates.map((item: any, i: number) => {
          if (item.title !== '' && item.body !== '') {
            if (item.body.toString().length < 500) {
              bodySave.append('template[' + i + '][id]', item.id);
              bodySave.append('template[' + i + '][title]', item.title);
              bodySave.append('template[' + i + '][body]', item.body);
              bodySave.append('template[' + i + '][user]', item.user);
              bodySave.append('template[' + i + '][country]', this.formTemplate.get('country').value);
              return item;
            } else {
              error2 = true;
            }
          } else {
            error = true;
          }
        });
        await Promise.all(templateReady).then(async () => {
          if (!error) {
            if (!error2) {
              this.onLoad = true;
              bodySave.append('country', this.formTemplate.get('country').value);
              await this.tms.create(bodySave).subscribe((res_: any) => {
                this.indexOnEdit = -1;
                this.isSaved = true;
                this.onLoad = true;
                this.tms.get({country: this.formTemplate.get('country').value}).subscribe((res: any) => {
                  if(this.formTemplate.get('country').value == 'ID'){
                    this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesaler : res.data.wholesaler;
                  }
                  else if(this.formTemplate.get('country').value == 'KH'){
                    this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesalerCambodia : res.data.wholesaler;
                  }
                  else if(this.formTemplate.get('country').value == 'PH'){
                    this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesalerPhili : res.data.wholesaler;
                  }
                  // if(this.formTemplateR.get('country').value == 'ID'){
                  //   this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailer : res.data.retailer;
                  // }
                  // else if(this.formTemplateR.get('country').value == 'KH'){
                  //   this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailerCambodia : res.data.retailer;
                  // }
                  // else if(this.formTemplateR.get('country').value == 'PH'){
                  //   this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailerPhili : res.data.retailer;
                  // }
                  
                  this.onLoad = false;
                }, error => {
                  this.onLoad = false;
                  this.isSaved = false
                  alert(error);
                });
                setTimeout(() => {
                  this.isSaved = false
                }, 1500);
              }, error => {
                this.onLoad = false;
                this.isSaved = false
                alert(error);
              });
            } else {
              this.onLoad = false;
              alert('Maksimal Teks Template 500 Karakter!')
            }
          } else {
            this.onLoad = false;
            alert('Lengkapi bagian template yang masih kosong!')
          }
        });
      }
    }

    if (user == "retailer") {
      if (this.deleteListRetailer.length > 0) {
        let deleteReady = await this.deleteListRetailer.map((item: any, i: number) => {
          bodyDelete.append('ids[' + i + ']', item.id);
        });
        await Promise.all(deleteReady).then(async () => {
          await this.deleteTemplates(bodyDelete, user);
        });
      } else {
        let templateReady = await this.retailerTemplates.map((item: any, i: number) => {
          if (item.title !== '' && item.body !== '') {
            if (item.body.toString().length < 500) {
              bodySave.append('template[' + i + '][id]', item.id);
              bodySave.append('template[' + i + '][title]', item.title);
              bodySave.append('template[' + i + '][body]', item.body);
              bodySave.append('template[' + i + '][user]', item.user);
              bodySave.append('template[' + i + '][country]', this.formTemplateR.get('country').value);
              return item;
            } else {
              error2 = true;
            }
          } else {
            error = true;
          }
        });
        await Promise.all(templateReady).then(async () => {
          if (!error) {
            if (!error2) {
              bodySave.append('country', this.formTemplateR.get('country').value);
              await this.tms.create(bodySave).subscribe((res_: any) => {
                this.indexOnEdit = -1;
                this.isSaved = true;
                this.onLoad = true;
                this.tms.get({country: this.formTemplateR.get('country').value}).subscribe((res: any) => {
                  // if(this.formTemplate.get('country').value == 'ID'){
                  //   this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesaler : res.data.wholesaler;
                  // }
                  // else if(this.formTemplate.get('country').value == 'KH'){
                  //   this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesalerCambodia : res.data.wholesaler;
                  // }
                  // else if(this.formTemplate.get('country').value == 'PH'){
                  //   this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesalerPhili : res.data.wholesaler;
                  // }
                  if(this.formTemplateR.get('country').value == 'ID'){
                    this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailer : res.data.retailer;
                  }
                  else if(this.formTemplateR.get('country').value == 'KH'){
                    this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailerCambodia : res.data.retailer;
                  }
                  else if(this.formTemplateR.get('country').value == 'PH'){
                    this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailerPhili : res.data.retailer;
                  }
                  // this.wholesalerTemplates = res.data.wholesaler.length < 5 ? defaultTemplateWholesaler : res.data.wholesaler;
                  // this.retailerTemplates = res.data.retailer < 5 ? defaultTemplateRetailer : res.data.retailer;
                  this.onLoad = false;
                });
                setTimeout(() => {
                  this.isSaved = false
                }, 1500);
              });
            } else {
              this.onLoad = false;
              alert('Maksimal Teks Template 500 Karakter!')
            }
          } else {
            this.onLoad = false;
            alert('Lengkapi bagian template yang masih kosong!')
          }
        });
      }
    }
  }

  getCountry() {

    this.tms.getCountry().subscribe(
      res => {
        this.RtCountry = res.data;
        this.WsCountry = res.data;


      },
      err => {
        console.error(err);
      }
    );
    

  }

  AddWholsalerCountry(item){
    this.WCountry = item;
    this.tms.get({country: this.WCountry}).subscribe((res: any) => {
      this.wholesalerTemplates = res.data.wholesaler;
      // this.retailerTemplates = res.data.retailer;
      // console.log(res.data.wholesaler[0].country, "res.data.wholesaler.country");
      if(res.data.country != null){
        // this.formTemplate.get('country').setValue(res.data.wholesaler[0].country);
        // console.log(this.formTemplate.get('country'),"this.formTemplate.get('country')");
        if(this.formTemplate.get('country').value == 'ID'){
          this.PageVariable = Pagevar;
        }
        else if(this.formTemplate.get('country').value == 'KH'){
          this.PageVariable = PagevarCam;
        }
        else if(this.formTemplate.get('country').value == 'PH'){
          this.PageVariable = PagevarPhi;
        }
      }
      // if(res.data.retailer.country != null){
      //   this.formTemplateR.get('country').setValue(res.data.wholesaler[0].country);
      //   console.log(this.formTemplateR.get('country'),"this.formTemplateR.get('country')");
      // }

      if (res.data.wholesaler.length == 0) {
        // this.getCountry();
        if(this.formTemplate.get('country').value == 'ID'){
          this.wholesalerTemplates = defaultTemplateWholesaler;
        }
        else if(this.formTemplate.get('country').value == 'KH'){
          this.wholesalerTemplates = defaultTemplateWholesalerCambodia;
        }
        else if(this.formTemplate.get('country').value == 'PH'){
          this.wholesalerTemplates = defaultTemplateWholesalerPhili;
        }
        // this.wholesalerTemplates.country = this.WCountry;
      }
      // if (res.data.retailer.length == 0) {
      //   // this.getCountry();
      //   this.retailerTemplates = defaultTemplateRetailer;
      //   // this.retailerTemplates.country = this.RCountry;
      // }
      this.onLoad = false;
    }, error => {
      this.onLoad = false;
      alert(error);
    })
  }
  AddRetailerCountry(item){
    this.RCountry = item;
    this.tms.get({country: this.RCountry}).subscribe((res: any) => {
      // this.wholesalerTemplates = res.data.wholesaler;
      this.retailerTemplates = res.data.retailer;
      // console.log(res.data.wholesaler[0].country, "res.data.wholesaler.country");
      // if(res.data.wholesaler[0].country != null){
      //   this.formTemplate.get('country').setValue(res.data.wholesaler[0].country);
      //   // console.log(this.formTemplate.get('country'),"this.formTemplate.get('country')");
        
      // }
        
      if(res.data.country != null){
        // this.formTemplateR.get('country').setValue(res.data.wholesaler[0].country);
        //console.log(this.formTemplateR.get('country'),"this.formTemplateR.get('country')");
        if(this.formTemplateR.get('country').value == 'ID'){
          console.log('1');
          
          this.RPageVariable = RPagevar;
        }
        else if(this.formTemplateR.get('country').value == 'KH'){
          console.log('2');
          this.RPageVariable = RPagevarCam;
        }
        else if(this.formTemplateR.get('country').value == 'PH'){
          console.log('3');
          this.RPageVariable = RPagevarPhi;
        }
      }

      // if (res.data.wholesaler.length == 0) {
      //   // this.getCountry();
      //   this.wholesalerTemplates = defaultTemplateWholesaler;
      //   // this.wholesalerTemplates.country = this.WCountry;
      // }
      if (res.data.retailer.length == 0) {
        // this.getCountry();
        if(this.formTemplateR.get('country').value == 'ID'){
          this.retailerTemplates = defaultTemplateRetailer;
        }
        else if(this.formTemplateR.get('country').value == 'KH'){
          this.retailerTemplates = defaultTemplateRetailerCambodia;
        }
        else if(this.formTemplateR.get('country').value == 'PH'){
          this.retailerTemplates = defaultTemplateRetailerPhili;
        }
        // this.retailerTemplates.country = this.RCountry;
      }
      this.onLoad = false;
    }, error => {
      this.onLoad = false;
      alert(error);
    })
  }


}