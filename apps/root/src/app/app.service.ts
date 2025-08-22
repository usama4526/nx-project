import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {
  readonly saveTemplateUrl =
    'https://ltsd.thelinksystems.com/builder/functions/savetemplate.php';
  readonly loadTemplateUrl =
    'https://ltsd.thelinksystems.com/builder/functions/getobject.php';
  readonly sendEmailUrl =
    'https://ltsd.thelinksystems.com/builder/functions/sendtestemail2.php';

  readonly mjmlPublicKey = '874f359e-0273-46d3-b33c-3a9d239f1bc3';
  readonly mjmlApplicationId = 'bd620e9e-8d92-4eb6-9708-7f541007e353';
  _http = inject(HttpClient);
  saveTemplate(body: any): Observable<any> {
    return this._http.post(this.saveTemplateUrl, body, {
      responseType: 'text' as const,
    });
  }
  loadTemplate(body: any): Observable<any> {
    return this._http.post(this.loadTemplateUrl, body, {
      responseType: 'text' as const,
    });
  }
  sendEmail(body: any): Observable<any> {
    return this._http.post(this.sendEmailUrl, body, {
      responseType: 'text' as const,
    });
  }
  mjmlConvert(mjml: any): Observable<any> {
    return this._http.post('https://api.mjml.io/v1/render', mjml, {
      headers: {
        Authorization: `Basic ${btoa(
          `${this.mjmlApplicationId}:${this.mjmlPublicKey}`
        )}`,
      },
      responseType: 'text' as const,
    });
  }
}
