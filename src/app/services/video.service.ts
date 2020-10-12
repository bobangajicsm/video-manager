import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable, throwError, from } from "rxjs";
import { map, concatMap } from "rxjs/operators";
import { Video, Category, Author, AuthorVideo } from "../models";

const authorsUrl = "http://localhost:3000/authors";
const categoriesUrl = "http://localhost:3000/categories";

@Injectable({
  providedIn: "root",
})
export class VideoService {
  constructor(private http: HttpClient) {}

  /**
   * looping true array of category ids and finding coresponding category names from
   * category list. It returns ex. [Thriller, Criminal] from [1, 3] array of ids
   */
  getVideoCategories(video: AuthorVideo, categories: Array<Category>): Array<string> {
    const videoCategories: Array<string> = [];

    video.catIds.forEach((catId: number) => {
      const foundCategory = categories.find((category) => category.id === catId);
      if (videoCategories) {
        videoCategories.push(foundCategory.name);
      }
    });

    return videoCategories;
  }

  /**
   * here we try to find highest quality format of video
   * so we loop true all formats and keep track of biggest resolution. If we
   * have more then one of the same resolution we check it's size so we take the biggest one.
   * Returned format is ex. one 1080p
   * from {one: {res: "1080p", size: 1000}, two: {res: "720p", size: 2000}, three: {res: "720p", size: 900}}
   */
  highestQualityFormatLabel(video: AuthorVideo): string {
    let highestFormat = 0;
    let biggestFormat = 0;
    let formatedLabel = "";

    Object.keys(video.formats).forEach((key: string) => {
      if (
        !highestFormat ||
        parseInt(video.formats[key].res) > highestFormat ||
        (parseInt(video.formats[key].res) === highestFormat && video.formats[key].size > biggestFormat)
      ) {
        highestFormat = parseInt(video.formats[key].res);
        biggestFormat = video.formats[key].size;
        formatedLabel = `${key} ${video.formats[key].res}`;
      }
    });

    return formatedLabel;
  }

  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(authorsUrl);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(categoriesUrl);
  }

  /**
   * we fetch both authors and categories and loop true all authors, stripping
   * videos into new array, mapping video category from categories list and at the
   * end we return new format matching our home table
   */
  getVideos(): Observable<Array<Video>> {
    const authors = this.http.get(authorsUrl);
    const categories = this.http.get(categoriesUrl);

    return forkJoin([authors, categories]).pipe(
      map((objArray: [Array<Author>, Array<Category>]) => {
        const _authors = objArray[0];
        const _categories = objArray[1];

        const videos: Array<Video> = [];
        _authors.forEach((author: Author) => {
          videos.push(
            ...author.videos.map((video: AuthorVideo) => {
              return {
                id: video.id,
                name: video.name,
                author: author.name,
                categories: this.getVideoCategories(video, _categories),
                highestQualityFormat: this.highestQualityFormatLabel(video),
                releaseDate: video.releaseDate,
              };
            })
          );
        });
        return videos;
      })
    );
  }

  /**
   * when we want to update author of video
   * we need to take video and push it to new author
   * and delete video from previous author
   */

  editVideoAuthor(
    video: AuthorVideo,
    videoName: string,
    videoCategories: Array<number>,
    author: Author,
    changeAuthor: Author | null = null
  ): Observable<any> {
    author.videos.push({
      id: video.id,
      catIds: videoCategories,
      name: videoName,
      formats: video.formats,
      releaseDate: video.releaseDate,
    });

    return forkJoin([
      this.deleteVideo({
        id: video.id,
        name: video.name,
        author: changeAuthor.name,
      }),
      this.http.patch<Author>(`${authorsUrl}/${author.id}`, {
        videos: author.videos,
      }),
    ]);
  }

  /**
   * if we are not updating video author we only need to patch updated values,
   * otherwise we call editVideoAuthor who handles that
   */

  editVideo(
    video: AuthorVideo,
    videoName: string,
    videoCategories: Array<number>,
    author: Author,
    changeAuthor: Author | null = null
  ): Observable<any> {
    if (changeAuthor) {
      return this.editVideoAuthor(video, videoName, videoCategories, author, changeAuthor);
    } else {
      const updatedVideos = author.videos.map((_video: AuthorVideo) => {
        if (_video.id === video.id) {
          return {
            id: video.id,
            catIds: videoCategories,
            name: videoName,
            formats: video.formats,
            releaseDate: video.releaseDate,
          };
        } else {
          return _video;
        }
      });

      return this.http.patch<Author>(`${authorsUrl}/${author.id}`, {
        videos: updatedVideos,
      });
    }
  }

  addVideo(videoName: string, videoCategories: Array<number>, author: Author, id: number): Observable<any> {
    const newVideo = {
      id,
      catIds: videoCategories,
      name: videoName,
      formats: {
        one: { res: "1080p", size: 1000 },
      },
      releaseDate: "-",
    };

    return this.http.patch<Author>(`${authorsUrl}/${author.id}`, {
      videos: [...author.videos, newVideo],
    });
  }

  /**
   * when deleting a video we fist need to find author of that video
   * loop true array of videos and remove the desired one
   */

  deleteVideo(video: Video): Observable<any> {
    return this.getAuthors().pipe(
      concatMap((authors: Array<Author>) => {
        const author = authors.find((_author: Author) => _author.name === video.author);

        if (author) {
          for (let i = 0; i < author.videos.length; i++) {
            if (author.videos[i] && author.videos[i].name === video.name) {
              author.videos.splice(i, 1);
              return this.http.patch<Author>(`${authorsUrl}/${author.id}`, {
                videos: author.videos,
              });
            }
          }
        } else {
          return throwError(new Error("No author found!"));
        }
      })
    );
  }
}
