import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideNgxEmailBuilderConfig } from '@wlocalhost/ngx-email-builder';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(appRoutes),
    provideAnimations(),
    provideNgxEmailBuilderConfig({
      convertorPath: 'https://www.linksnodejs.com/',
    }),
  ],
};
