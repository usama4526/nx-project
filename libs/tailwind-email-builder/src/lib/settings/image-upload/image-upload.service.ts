import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  readonly uploadImageUrl =
    'https://ltsd.thelinksystems.com/builder/functions/saveimage.php';
  _http = inject(HttpClient);

  uploadImage(formData: FormData): Observable<string> {
    return this._http.post(this.uploadImageUrl, formData, {
      responseType: 'text' as const,
    });
  }
}
