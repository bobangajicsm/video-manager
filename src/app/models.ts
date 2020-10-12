export interface Category {
  id: number;
  name: string;
}

export interface Resolution {
  res: string;
  size: number;
}

export interface AuthorVideo {
  id: number;
  catIds: Array<number>;
  name: string;
  formats: {
    [key: string]: Resolution;
  };
  releaseDate: Date;
}

export interface Author {
  id: number;
  name: string;
  videos: Array<AuthorVideo>;
}

export interface Video {
  id: number;
  name: string;
  author: string;
  categories?: Array<string>;
  highestQualityFormat?: string;
  releaseDate?: Date;
}
