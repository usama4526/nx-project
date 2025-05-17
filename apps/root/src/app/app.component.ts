import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  TailwindEmailBuilderModule,
  UIFormModule,
} from '@wlocalhost/ngx-tailwind-email-builder';
import { injectIIPEmail } from '@wlocalhost/ngx-email-builder';
import {
  CdkMenu,
  CdkMenuBar,
  CdkMenuItem,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import { lastValueFrom } from 'rxjs';
import { AppService } from './app.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    TailwindEmailBuilderModule,
    UIFormModule,
    CdkMenuBar,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
  ],
  selector: 'app-root',
  template: `
    <tail-email-builder>
      <div class="top-actions flex gap-2 justify-between w-full" cdkMenuBar>
        <!-- <button tailBtn cdkMenuItem [cdkMenuTriggerFor]="exportMenu">
          Export Email
        </button>
        <label tailBtn cdkMenuItem class="cursor-pointer">
          Import JSON
          <input type="file" (input)="importJSON($event)" class="hidden" />
        </label> -->
        <button tailBtn (click)="saveEmailJson()">Save Template</button>
        <button
          (click)="sendEmail()"
          class="bg-blue-500 text-white border px-2 py-1.5 text-sm"
        >
          Send Email
        </button>
      </div>
    </tail-email-builder>

    <ng-template #exportMenu>
      <div class="flex bg-white shadow-lg p-4 rounded gap-4" cdkMenu>
        <button
          class="hover:bg-gray-200"
          tailBtn
          (click)="exportEmail('HTML')"
          cdkMenuItem
        >
          HTML
        </button>
        <button
          class="hover:bg-gray-200"
          tailBtn
          (click)="exportEmail('MJML')"
          cdkMenuItem
        >
          MJML
        </button>
        <button
          class="hover:bg-gray-200"
          tailBtn
          (click)="exportEmail('JSON')"
          cdkMenuItem
        >
          JSON
        </button>
      </div>
    </ng-template>
  `,
})
export class AppComponent implements OnInit {
  readonly currentEmail = injectIIPEmail();
  _activeRoute = inject(ActivatedRoute);
  _appService = inject(AppService);
  templateInfo: { id: string; type: string; domain: string } = {
    id: '',
    type: '',
    domain: '',
  };
  #effect = effect(() => {
    const email = this.currentEmail.value();
  });

  ngOnInit() {
    this.getQueryParams();
    setTimeout(() => {
      this.loadSavedTemplate();
    }, 1000);
    this.currentEmail.options({
      name: 'Test Email',
      previewText: '',
    });
    const structure = this.currentEmail.structures.add('cols_1');
    this.currentEmail.blocks.add(structure, 0, 0, {
      type: 'text',
      context: {
        innerText:
          '<p style="text-align: center;">This is sample <strong>Text </strong>for short <span style="color: #2dc26b;">or long <span>description</span></span></p>',
      },
    });
    this.currentEmail.blocks.add(structure, 0, 1, {
      type: 'social',
      context: { networks: [{ name: 'vimeo', link: 'dsomething' }] },
    });
    this.currentEmail.blocks.add(structure, 0, 2, {
      type: 'text',
      context: {
        innerText: '<p style="text-align:center">{{disclaimer}}</p',
      },
    });
  }

  getQueryParams() {
    this._activeRoute.queryParams.subscribe((params) => {
      this.templateInfo.id = params['id'];
      this.templateInfo.type = params['type'];
      this.templateInfo.domain = params['domain'];
    });
  }

  loadSavedTemplate() {
    this._appService.loadTemplate(this.templateInfo).subscribe({
      next: (res) => {
        this.currentEmail.set(JSON.parse(res));
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  /**
   * An example of how to export the email to a file
   *
   * @param type
   */
  async exportEmail(type: 'HTML' | 'MJML' | 'JSON') {
    try {
      let exportedFile = JSON.stringify(this.currentEmail.value(), null, 2);
      if (type !== 'JSON') {
        const { html, mjml } = await lastValueFrom(this.currentEmail.convert());

        exportedFile = type === 'HTML' ? html : mjml;
      }
      console.log(exportedFile);

      const blob = new Blob([exportedFile], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email.${type.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * An example of how to import a JSON file to the email
   * TODO: Add support for new `model` API, now `set` method is raising some issues with DnD
   *
   * @param event
   */
  importJSON(event: Event) {
    try {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file || !file.type.includes('json')) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.currentEmail.set(JSON.parse(reader.result as string));
      };
      reader.readAsText(file);
    } catch (error) {
      console.error(error);
    } finally {
      (event.target as HTMLInputElement).value = '';
    }
  }

  async saveEmailJson() {
    const jsonEmail = this.currentEmail.value();
    const { html: htmlEmail } = await lastValueFrom(
      this.currentEmail.convert()
    );
    console.log(
      JSON.stringify({
        email: jsonEmail,
        html: htmlEmail,
        id: this.templateInfo.id,
        type: this.templateInfo.type,
        domain: this.templateInfo.domain,
      })
    );

    this._appService
      .saveTemplate(
        JSON.stringify({
          email: jsonEmail,
          html: htmlEmail,
          id: this.templateInfo.id,
          type: this.templateInfo.type,
          domain: this.templateInfo.domain,
        })
      )
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  async sendEmail() {
    const jsonEmail = this.currentEmail.value();
    console.log(this.currentEmail);

    const { html: htmlEmail, mjml } = await lastValueFrom(
      this.currentEmail.convert()
    );
    //console.log(jsonEmail);

    this._appService.mjmlConvert({ mjml: mjml }).subscribe({
      next: (res) => {
        let data = res;
        data = JSON.parse(data);
        //console.log(data);

        const body = JSON.stringify({
          email: jsonEmail,
          html: data.html,
          emailaddress: 'wusama19@gmail.com',
        });

        setTimeout(() => {
          console.log(body);
          this._appService.sendEmail(body).subscribe({
            next: (res) => {
              console.log(res);
            },
            error: (err) => {
              console.log(err);
            },
          });
        }, 1000);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
