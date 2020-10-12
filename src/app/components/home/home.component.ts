import { Component, OnInit, OnDestroy } from "@angular/core";
import { VideoService } from "../../services/video.service";
import { Observable } from "rxjs/internal/Observable";
import { Video } from "../../models";
import { FormControl } from "@angular/forms";
import { startWith, map } from "rxjs/operators";
import { Subscription } from "rxjs";
import { ToastService } from "../../services/toast.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {
  videos: Array<Video>;
  videos$: Observable<Array<Video>>;
  videosSubscription: Subscription;
  deleteVideoSubscription: Subscription;
  filter = new FormControl("");

  constructor(private videoService: VideoService, private router: Router, private toastService: ToastService) {}

  ngOnInit(): void {
    this.getVideos();
  }

  getVideos() {
    this.videosSubscription = this.videoService.getVideos().subscribe((_videos: Array<Video>) => {
      this.videos = _videos;

      this.videos$ = this.filter.valueChanges.pipe(
        startWith(""),
        map((text) => this.search(text))
      );
    });
  }

  onVideoEdit(videoId: number) {
    this.router.navigate([`/home/edit-video/${videoId}`]);
  }

  onVideoDelete(video: Video) {
    const deleteConfirm = confirm("You are about to delete this video?!");
    if (deleteConfirm) {
      this.deleteVideoSubscription = this.videoService.deleteVideo(video).subscribe(
        () => {
          this.getVideos();
          this.toastService.show("Video successfully deleted", {
            classname: "bg-success text-light",
            delay: 10000,
          });
        },
        () => {
          this.toastService.show("Failed to delete the video.", {
            classname: "bg-danger text-light",
            delay: 10000,
          });
        }
      );
    }
  }

  ngOnDestroy() {
    if (this.videosSubscription) {
      this.videosSubscription.unsubscribe();
    }

    if (this.deleteVideoSubscription) {
      this.deleteVideoSubscription.unsubscribe();
    }
  }

  search(text: string): Array<Video> {
    return this.videos.filter((video) => {
      const term = text.toLowerCase();
      return video.name.toLowerCase().includes(term);
    });
  }
}
