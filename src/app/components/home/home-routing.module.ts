import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddVideoComponent } from "./add-video/add-video.component";
import { HomeComponent } from "./home.component";

const routes: Routes = [
  {
    path: "",
    children: [
      { path: "", component: HomeComponent },
      { path: "add-video", component: AddVideoComponent },
      { path: "edit-video/:videoId", component: AddVideoComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
