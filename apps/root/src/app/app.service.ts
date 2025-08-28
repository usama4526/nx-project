import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DomainService } from './domain.service';

@Injectable({ providedIn: 'root' })
export class AppService {
  private domainService = inject(DomainService);

  get saveTemplateUrl(): string {
    const url = `${this.domainService.getApiBaseUrl()}/builder/functions/savetemplate.php`;
    console.log(`AppService: Save template URL: ${url}`);
    return url;
  }

  get loadTemplateUrl(): string {
    const url = `${this.domainService.getApiBaseUrl()}/builder/functions/getobject.php`;
    console.log(`AppService: Load template URL: ${url}`);
    return url;
  }

  get sendEmailUrl(): string {
    const url = `${this.domainService.getApiBaseUrl()}/builder/functions/sendtestemail2.php`;
    console.log(`AppService: Send email URL: ${url}`);
    return url;
  }

  readonly mjmlPublicKey = '874f359e-0273-46d3-b33c-3a9d239f1bc3';
  readonly mjmlApplicationId = 'bd620e9e-8d92-4eb6-9708-7f541007e353';
  _http = inject(HttpClient);
  
  saveTemplate(body: any): Observable<any> {
    console.log(`AppService: Making save template request to: ${this.saveTemplateUrl}`);
    return this._http.post(this.saveTemplateUrl, body, {
      responseType: 'text' as const,
    });
  }
  
  loadTemplate(body: any): Observable<any> {
    console.log(`AppService: Making load template request to: ${this.loadTemplateUrl}`);
    return this._http.post(this.loadTemplateUrl, body, {
      responseType: 'text' as const,
    });
  }
  
  sendEmail(body: any): Observable<any> {
    console.log(`AppService: Making send email request to: ${this.sendEmailUrl}`);
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
