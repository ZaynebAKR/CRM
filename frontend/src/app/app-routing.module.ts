import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { InsomeaDashboardComponent } from './pages/insomea-dashboard/insomea-dashboard.component';
import { PartenaireDashboardComponent } from './pages/partenaire-dashboard/partenaire-dashboard.component';
import { ClientDashboardComponent } from './pages/client-dashboard/client-dashboard.component';
import { MicrosoftDashboardComponent } from './pages/microsoft-dashboard/microsoft-dashboard.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'insomea-dashboard', component: InsomeaDashboardComponent, canActivate: [authGuard] },
  { path: 'partenaires-dashboard', component: PartenaireDashboardComponent, canActivate: [authGuard] },
  { path: 'client-dashboard', component: ClientDashboardComponent, canActivate: [authGuard] },
  { path: 'microsoft-dashboard', component: MicrosoftDashboardComponent, canActivate: [authGuard] },

  { path: 'reset-password', component: ResetPasswordComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
