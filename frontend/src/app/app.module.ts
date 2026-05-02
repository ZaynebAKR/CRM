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
import { MicrosoftDashboardComponent } from './pages/microsoft-dashboard/microsoft-dashboard.component';
import { InsomeaDashboardComponent } from './pages/insomea-dashboard/insomea-dashboard.component';
import { PartenaireDashboardComponent } from './pages/partenaire-dashboard/partenaire-dashboard.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AboutusComponent,
    ClientDashboardComponent,
    MicrosoftDashboardComponent,
    InsomeaDashboardComponent,
    PartenaireDashboardComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent

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
