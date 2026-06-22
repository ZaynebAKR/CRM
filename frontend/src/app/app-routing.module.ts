import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ChatbotComponent } from './pages/chatbot/chatbot.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { PricelistDashboardComponent } from './pages/pricelist-dashboard/pricelist-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { InsomeaDashboardComponent } from './pages/insomea-dashboard/insomea-dashboard.component';
import { ClientDashboardComponent } from './pages/client-dashboard/client-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { SalesDashboardComponent } from './pages/sales-dashboard/sales-dashboard.component';
import { FinanceDashboardComponent } from './pages/finance-dashboard/finance-dashboard.component';
import { TechDashboardComponent } from './pages/tech-dashboard/tech-dashboard.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AiOptimizerComponent } from './pages/ai-optimizer/ai-optimizer.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'chat', component: ChatbotComponent },

{
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'insomea-dashboard',   component: InsomeaDashboardComponent },
      { path: 'sales-dashboard',   component: SalesDashboardComponent },
      { path: 'finance-dashboard', component: FinanceDashboardComponent },
      { path: 'tech-dashboard',    component: TechDashboardComponent },
      { path: 'client-dashboard',    component: ClientDashboardComponent },
      { path: 'pricelist-dashboard', component: PricelistDashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'ai-optimizer', component: AiOptimizerComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }