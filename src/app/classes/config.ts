import { GeneralService } from 'app/services/general.service';
import { Endpoint } from 'app/classes/endpoint';
import { environment, serviceServer, server } from '../../environments/environment';
import * as SJCL from 'sjcl';
import { constants } from 'os';
import { isLength } from 'lodash';

const AYO_API_SERVICE = serviceServer;
const appId = 'ayosrc-8lv9mbp2ce6iwr'; // STAGING-DXTR
// const appId = 'ayosrc-tzvpgcnxyliz1g'; // PRODUCTION - AYO SRC

const appIdMC = 'zova-efc1mal9p9cjurph'; // Multichannel - STAGING-DXTR
// const appIdMC = 'empty-(payment)'; // Multichannel - PRODUCTION - AYO SRC
export class Config {

  public static QISCUS_CONFIG = {
    appId: appId,
    baseUri: `https://${appId}.qiscus.com`,
    appIdMC: appIdMC,
  };

  public static FROALA_CONFIG_NOTIFICATION: Object = {
    key: 'mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==',
    placeholderText: 'Isi Halaman',
    height: 450,
    quickInsertTags: [''],
    quickInsertButtons: [''],
    enter: 'ENTER_BR',
    toolbarButtons: ['undo', 'redo', '|', 'insertLink', 'insertImage', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote',],
    htmlSimpleAmpersand: true,
    entities: '',
    imageUpload: true,
    pasteImage: true,
    imageDefaultAlign: 'left',
    imageDefaultDisplay: 'inline-block',
    // Set max image size to 10MB.
    imageMaxSize: 10 * 1024 * 1024,
    // Allow to upload PNG and JPG.
    imageAllowedTypes: ['jpeg', 'jpg', 'png'],
    events: {
      'froalaEditor.image.beforeUpload': function (e, editor, images) {
        let token = null;
        function tkn() {
          const data = JSON.parse(window.localStorage.getItem('_adxtrn'));
          if (!data) { return null; }
          const enc = SJCL.decrypt('dxtr-asia.sampoerna', data);
          return JSON.parse(enc);
        }
        token = tkn();
        // console.log('token', token);
        if (token) {
          const formdata = new FormData();
          formdata.append('upload', images[0], 'file');

          const myHeaders = new Headers();
          myHeaders.append('Accept', 'application/json');
          myHeaders.append('Authorization', `Bearer ${token.access_token}`);
          const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
          };

          fetch(`${AYO_API_SERVICE(server.content)}/api/v1/content/general/upload/image`, requestOptions)
            .then((res: any) => {
              return res.json();
            })
            .then(result => {
              console.log(result);
              editor.image.insert(result.data.url, null, null, editor.image.get());
            })
            .catch(error => console.log('error', error));
        }
        return false;
      }
    }
  };

  public static AYO_AUTHORIZATION = {
    grant_type: 'password',
    client_id: 2,
    client_secret: '0QkMRDzTDe4cpLOYUHdDsqG70msWBX5q1zWXpH0D'
  };

  public static FROALA_CONFIG: Object = {
    key: 'mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==',
    placeholderText: 'Isi Halaman',
    height: 150,
    quickInsertTags: [''],
    quickInsertButtons: [''],
    imageUpload: false,
    pasteImage: false,
    enter: 'ENTER_BR',
    toolbarButtons: ['undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote', 'insertLink'],
    htmlSimpleAmpersand: true,
    entities: '',
    events: {
      // untuk menambahkan id pada froala
      'froalaEditor.initialized': function(e, editor){
        setTimeout(() => {
          editor.el.id = e.currentTarget.getAttribute("data-froala-id");
        }, 500);
      },
    }
  };

  public static FROALA_CONFIG_PERSONALIZE: Object = {
    key: 'mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==',
    placeholderText: 'Isi Halaman',
    height: 150,
    quickInsertTags: [''],
    quickInsertButtons: [''],
    imageUpload: false,
    pasteImage: false,
    enter: 'ENTER_BR',
    toolbarButtons: ['undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote', 'insertLink'],
    htmlSimpleAmpersand: true,
    entities: '',
    events: {
      // untuk menambahkan id pada froala
      'froalaEditor.initialized': function(e, editor){
        setTimeout(() => {
          editor.el.id = e.currentTarget.getAttribute("data-froala-id");
        }, 500);
      },
      'froalaEditor.keyup': function (e, editor, event) {
        if (event.keyCode === 32) {
          var value = event.target.textContent;
          value = value.replace(
            /(##[0-9]+)/g,
            (match: any) => { return `<strong>${match}</strong>`}
          );
    
          if (value !== event.target.textContent) {
            const el = event.target;
            el.innerHTML = value;
      
            const selection = window.getSelection();
            const range = document.createRange();
      
            selection.removeAllRanges();
            range.selectNodeContents(el);
            range.collapse(false);
            selection.addRange(range);
            el.focus();
          }
        }
      }
    }
  };

  public static FROALA_CUSTOM_TITLE_CONFIG = (title?) => ({
    key: 'mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==',
    placeholderText: title ? title : 'Isi Halaman',
    height: 150,
    quickInsertTags: [''],
    quickInsertButtons: [''],
    imageUpload: false,
    pasteImage: false,
    enter: 'ENTER_BR',
    toolbarButtons: ['undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote'],
    htmlSimpleAmpersand: true,
    entities: ''
  })

}
