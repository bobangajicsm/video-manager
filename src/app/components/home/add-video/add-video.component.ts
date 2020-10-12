import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { VideoService } from "../../../services/video.service";
import { Category, Author, AuthorVideo } from "../../../models";
import { Observable, Subscription } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from "../../../services/toast.service";

@Component({
  selector: "app-add-video",
  templateUrl: "./add-video.component.html",
  styleUrls: ["./add-video.component.css"],
})
export class AddVideoComponent implements OnInit, OnDestroy {
  editVideo: AuthorVideo;
  editAuthor: Author;
  title = "";
  urlParamVideoId = null;
  categories$: Observable<Category[]>;
  authors: Author[];
  authorsSubscription: Subscription;
  addVideoSubscription: Subscription;
  editVideoSubscription: Subscription;
  addVideoForm = new FormGroup({
    videoName: new FormControl("", Validators.required),
    videoAuthor: new FormControl("", Validators.required),
    videoCategories: new FormControl("", Validators.required),
  });

  constructor(
    private videoService: VideoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.urlParamVideoId = this.activatedRoute.snapshot.params["videoId"];
    this.categories$ = this.videoService.getCategories();
    this.authorsSubscription = this.videoService.getAuthors().subscribe((authors: Array<Author>) => {
      this.authors = authors;
      if (this.urlParamVideoId) {
        this.title = "Edit video";
        const foundVideo = this.findVideo(parseInt(this.urlParamVideoId));
        this.editVideo = foundVideo.video;
        this.editAuthor = foundVideo.author;
        this.updateForm(this.editVideo);
      } else {
        this.title = "Add video";
      }
    });
  }

  updateForm(video: AuthorVideo | void) {
    if (video) {
      this.addVideoForm.patchValue({
        videoName: video.name,
        videoCategories: video.catIds,
        videoAuthor: this.editAuthor,
      });
    }
  }

  findVideo(videoId: number): { video: AuthorVideo; author: Author } {
    for (let i = 0; i < this.authors.length; i++) {
      if (this.authors[i] && this.authors[i].videos) {
        for (let x = 0; x < this.authors[i].videos.length; x++) {
          if (this.authors[i].videos[x].id === videoId) {
            return {
              video: this.authors[i].videos[x],
              author: this.authors[i],
            };
          }
        }
      }
    }
  }

  /**
   * when adding new video we need to pass an id to a new video,
   * so we first find what is the highest id of all videos, and then we just increase by one
   */

  getNewVideoId(authors: Array<Author>): number {
    let highestId = 0;
    authors.forEach((author: Author) => {
      author.videos.forEach((video: AuthorVideo) => {
        if (video.id > highestId) {
          highestId = video.id;
        }
      });
    });

    return highestId + 1;
  }

  createVideo(videoName: string, videoCategories: Array<number>, videoAuthor: Author) {
    this.addVideoSubscription = this.videoService
      .addVideo(videoName, videoCategories, videoAuthor, this.getNewVideoId(this.authors))
      .subscribe(
        () => {
          this.toastService.show("Video successfully added", {
            classname: "bg-success text-light",
            delay: 10000,
          });
          this.router.navigate(["/home"]);
        },
        () => {
          this.toastService.show("Failed to add video.", {
            classname: "bg-danger text-light",
            delay: 10000,
          });
        }
      );
  }

  updateVideo(videoName: string, videoCategories: Array<number>, videoAuthor: Author) {
    let oldAuthor = null;
    if (videoAuthor.id !== this.editAuthor.id) {
      oldAuthor = this.editAuthor;
    }

    this.editVideoSubscription = this.videoService
      .editVideo(this.editVideo, videoName, videoCategories, videoAuthor, oldAuthor)
      .subscribe(
        () => {
          this.toastService.show("Video successfully updated", {
            classname: "bg-success text-light",
            delay: 10000,
          });
          this.router.navigate(["/home"]);
        },
        (error) => {
          this.toastService.show("Failed to update video.", {
            classname: "bg-danger text-light",
            delay: 10000,
          });
        }
      );
  }

  onCancel() {
    this.router.navigate(["/home"]);
  }

  onSubmit() {
    const { videoAuthor, videoCategories, videoName } = this.addVideoForm.value;

    if (this.urlParamVideoId) {
      this.updateVideo(videoName, videoCategories, videoAuthor);
    } else {
      this.createVideo(videoName, videoCategories, videoAuthor);
    }
  }

  ngOnDestroy() {
    if (this.authorsSubscription) {
      this.authorsSubscription.unsubscribe();
    }
    if (this.addVideoSubscription) {
      this.addVideoSubscription.unsubscribe();
    }
    if (this.editVideoSubscription) {
      this.editVideoSubscription.unsubscribe();
    }
  }
}
