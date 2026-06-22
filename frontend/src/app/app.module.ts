import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { ClientDashboardComponent } from './pages/client-dashboard/client-dashboard.component';
import { InsomeaDashboardComponent } from './pages/insomea-dashboard/insomea-dashboard.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ChatbotComponent } from './pages/chatbot/chatbot.component';
import { PricelistDashboardComponent } from './pages/pricelist-dashboard/pricelist-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { SalesDashboardComponent } from './pages/sales-dashboard/sales-dashboard.component';
import { FinanceDashboardComponent } from './pages/finance-dashboard/finance-dashboard.component';
import { TechDashboardComponent } from './pages/tech-dashboard/tech-dashboard.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AiOptimizerComponent } from './pages/ai-optimizer/ai-optimizer.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AboutusComponent,
    ClientDashboardComponent,
    InsomeaDashboardComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ChatbotComponent,
    PricelistDashboardComponent,
    ProfileComponent,
    LayoutComponent,
    SalesDashboardComponent,
    FinanceDashboardComponent,
    TechDashboardComponent,
    DashboardComponent,
    ManageUsersComponent,
    SettingsComponent,
    AiOptimizerComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule, 
    HttpClientModule, 
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
