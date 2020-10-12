import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { NavComponent } from "./components/nav/nav.component";
import { AppRoutingModule } from "./routing.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ErrorInterceptor } from "./error.interceptor";
import { HomeModule } from "./components/home/home.module.module";
import { ToastsComponent } from "./components/toasts/toasts.component";
import { FooterComponent } from "./components/footer/footer.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";

@NgModule({
  declarations: [AppComponent, NavComponent, ToastsComponent, FooterComponent],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    NgbModule,
    AppRoutingModule,
    HomeModule,
    ServiceWorkerModule.register("ngsw-worker.js", { enabled: environment.production }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
