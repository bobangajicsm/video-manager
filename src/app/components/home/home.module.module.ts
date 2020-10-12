import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HomeComponent } from "./home.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AddVideoComponent } from "./add-video/add-video.component";
import { HomeRoutingModule } from "./home-routing.module";

@NgModule({
  declarations: [HomeComponent, AddVideoComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HomeRoutingModule],
})
export class HomeModule {}
