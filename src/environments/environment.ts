export const environment = {
  production: true,
  server: "https://api.src.id",
  server_service: "https://api.src.id",
  label: "PRODUCTION",
  show_label: false,
  image: "assets/images/ayo/AYO_SRC_(Master).png",
  image_2x: "assets/images/ayo/AYO_SRC_(Master)@2x.png 2x",
  backgroundImage: "assets/images/ayo/header/Header-Color-Red@2x.jpg",
  qiscus_appIdMC: 'ofle-qm9wadiam8zza5sn', //payment required
};

export const serviceServer = (server) => {
  return `https://${server}.api.src.id`;
}

export const server = {
  user: "users",
  business: "businesses",
  area: "areas",
  auth: "auth",
  newsfeed: "newsfeed",
  banner: "banner",
  content: "contentstatic",
  product: "product",
  task: "task-management",
  submission: "task-submission",
  coin: "coin-management",
  community: "community",
  order: "order",
}

// // This file can be replaced during build by using the `fileReplacements` array.
// // `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// // The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: true,
//   server: "https://dev.ayo-api.dxtr.asia",
//   server_service: "http://dev.ayo-api.dxtr.asia",
//   label: "DEVELOPMENT",
//   show_label: true,
//   image: "assets/images/ayo/icon/dev.png",
//   image_2x: "assets/images/ayo/icon/dev@2x.png 2x",
//   backgroundImage: "assets/images/ayo/header/Header-Color-Blue@2x.jpg",
//   localDev: "http://sampoerna.local",
//   qiscus_appIdMC: 'zova-efc1mal9p9cjurph', //Staging
// };

// export const serviceServer = (server) => {
//   return `http://${server}.ayo-micro.dxtr.asia`;
// }

// export const server = {
//   user: "user",
//   business: "business",
//   area: "area",
//   auth: "auth",
//   newsfeed: "newsfeed",
//   banner: "banner",
//   content: "content",
//   product: "product",
//   task: "task",
//   submission: "submission",
//   coin: "coin",
//   community: "community",
//   order: "order",
// }

// /*
//  * In development mode, to ignore zone related error stack frames such as
//  * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
//  * import the following file, but please comment it out in production mode
//  * because it will have performance impact when throw error
//  */
// // import 'zone.js/dist/zone-error';  // Included with Angular CLI.