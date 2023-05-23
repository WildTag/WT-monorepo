export interface UploadedImage {
  filename: string;
  metadata: ImageMetadata;
  image: string;
}

export interface ImageMetadata {
  gps_latitude: number;
  gps_longitude: number;
  date_time_original: Date;
}
