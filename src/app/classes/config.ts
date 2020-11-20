export class Config {
  public static AYO_AUTHORIZATION = {
    grant_type: 'password',
    client_id: 2,
    client_secret: '0QkMRDzTDe4cpLOYUHdDsqG70msWBX5q1zWXpH0D'
  }

  public static FROALA_CONFIG: Object = {
    key: "mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==",
    placeholderText: "Isi Halaman",
    height: 150,
    quickInsertTags: [""],
    quickInsertButtons: [""],
    imageUpload: false,
    pasteImage: false,
    enter: "ENTER_BR",
    toolbarButtons: ['undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote'],
    htmlSimpleAmpersand: true,
    entities: ''
  }

  public static FROALA_CUSTOM_TITLE_CONFIG = (title?) => ({
    key: "mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==",
    placeholderText: title ? title : "Isi Halaman",
    height: 150,
    quickInsertTags: [""],
    quickInsertButtons: [""],
    imageUpload: false,
    pasteImage: false,
    enter: "ENTER_BR",
    toolbarButtons: ['undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote'],
    htmlSimpleAmpersand: true,
    entities: ''
  })

  // public static server = {
  //   user: "user",
  //   business: "business",
  //   area: "area",
  //   auth: "auth",
  //   newsfeed: "newsfeed",
  //   banner: "banner",
  //   content: "contentstatic"
  // }
}