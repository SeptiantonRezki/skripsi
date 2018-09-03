import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { AuthGuard } from "./classes/auth.guard";
import { NonAuthGuard } from "./classes/non-auth.guard";

// routes
const appRoutes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "dashboard",
    loadChildren: "./pages/dashboard/dashboard.module#DashboardModule",
    canActivate: [AuthGuard]
  },
  {
    path: "user-management",
    loadChildren:
      "./pages/user-management/user-management.module#UserManagementModule",
    canActivate: [AuthGuard]
  },
  {
    path: "advertisement",
    loadChildren:
      "./pages/inapp-marketing/inapp-marketing.module#InappMarketingModule",
    canActivate: [AuthGuard]
  },
  {
    path: "sku-management",
    loadChildren:
      "./pages/sku-management/sku-management.module#SkuManagementModule",
    canActivate: [AuthGuard]
  },
  {
    path: "dte",
    loadChildren: "./pages/dte/dte.module#DteModule",
    canActivate: [AuthGuard]
  },
  {
    path: "notifications",
    loadChildren: "./pages/notification/notification.module#NotificationModule",
    canActivate: [AuthGuard]
  },
  {
    path: "content-management",
    loadChildren:
      "./pages/content-management/content-management.module#ContentManagementModule",
    canActivate: [AuthGuard]
  },
  {
    path: "newsfeed-management",
    loadChildren:
      "./pages/newsfeed-management/newsfeed-management.module#NewsfeedManagementModule",
    canActivate: [AuthGuard]
  },
  {
    path: "settings",
    loadChildren: "./pages/settings/settings.module#SettingsModule",
    canActivate: [AuthGuard]
  },
  {
    path: "login",
    loadChildren: "./pages/login/login.module#LoginModule",
    canActivate: [NonAuthGuard]
  },
  {
    path: "forgot-password",
    loadChildren:
      "./pages/forgot-password/forgot-password.module#ForgotPasswordModule",
    canActivate: [NonAuthGuard]
  },
  {
    path: "reset-password",
    loadChildren:
      "./pages/reset-password/reset-password.module#ResetPasswordModule",
    canActivate: [NonAuthGuard]
  },
  {
    path: "admin",
    loadChildren: "./pages/admin/admin.module#AdminModule",
    canActivate: [AuthGuard]
  },
  {
    path: "**",
    loadChildren: "./pages/404/error-404.module#Error404Module"
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      // preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
