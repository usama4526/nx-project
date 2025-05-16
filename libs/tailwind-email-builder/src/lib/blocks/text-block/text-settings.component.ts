import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormsModule, NgForm } from '@angular/forms';

import { ColorComponent } from '../../settings/color/color.component';
import { FontComponent } from '../../settings/font/font.component';
import { UIFormModule } from '../../directives/form/form-input.directive';
import { LineHeightComponent } from '../../settings/line-height/line-height.component';
import { PaddingComponent } from '../../settings/padding/padding.component';
import { formViewProvider } from '../../directives/form-providers';
import type { ITextBlockOptions } from './text-block.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { EditorComponent, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

@Component({
  selector: 'tail-text-settings',
  imports: [
    CdkTextareaAutosize,
    ColorComponent,
    FontComponent,
    UIFormModule,
    FormsModule,
    LineHeightComponent,
    PaddingComponent,
    EditorComponent,
  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
  ],
  template: `
    <div tailPanel class="mt-4">
    <editor
    ngModel
    name="innerText" 
    [init]="init"
  />
      <!-- <textarea tailInput  cdkTextareaAutosize
                cdkAutosizeMinRows="4"></textarea> -->
    </div>
 
    <ng-container ngModelGroup="options">
      <h2 tailH2 i18n="@@font">Font</h2>
      <div tailPanel class="hidden">
        <h3 tailH3 i18n="@@text_color">Color</h3>
        <tail-color />
        <tail-font class="pt-2" />
        <tail-line-height class="pt-2" />
      </div>
      <h2 tailH2 i18n="@@padding">Padding</h2>
      <div tailPanel>
        <tail-padding />
      </div>
    </ng-container>
  `,
  styles: `
    :host {
      display: block;
    }
   
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [formViewProvider()],
})
export class TextSettingsComponent implements AfterViewInit {
  mergeTags = [
    '{{disclaimer}}',
    '{AgentName}',
    '{address}',
    '{RepName1}',
    '{RepPhone1}',
    '{RepEmail1}',
    '{RepName2}',
    '{RepPhone2}',
    '{RepEmail2}',
    '{RepName3}',
    '{RepPhone3}',
    '{RepEmail3}',
    '{RepName4}',
    '{RepPhone4}',
    '{RepEmail4}',
    '{RepName5}',
    '{RepPhone5}',
    '{RepEmail5}',
    '{County}',
    '{RepWebsite}',
    '{RepHeaderImage}',
    '{teamnamemerger}',
    '{VideoName}',
    '{VideoURL}',
    '{onbehalf_repname}',
    '{branchname}',
    '{companyname}',
    '{createpdfcode}',
    '{{farmrequest}}',
    '{{opentitle}}',
    '{{opentitleform}}',
    '{{MelloRoose}}',
    '{{Comps}}',
  ];
  init: EditorComponent['init'] = {
    base_url: '/assets/tinymce', // This must match the new output path
    suffix: '.min',
    branding: false,
    plugins: 'lists link image table',
    toolbar:
      'formatselect mailchimpMergeTags fontfamily fontsizeinput bold underline italic link alignleft aligncenter alignright alignjustify backcolor forecolor subscript superscript code ',
    setup: (editor: any) => {
      editor.ui.registry.addMenuButton('mailchimpMergeTags', {
        text: 'Merge Tags',
        fetch: (callback: any) => {
          const items = this.mergeTags.map((tag) => ({
            type: 'menuitem',
            text: tag,
            onAction: () => editor.insertContent(tag),
          }));
          callback(items);
        },
      });
    },
  };
  readonly innerText = model.required<string>();
  readonly options = model.required<ITextBlockOptions>();
  readonly form = inject(NgForm);
  readonly takeUntilDestroyed = takeUntilDestroyed<{
    innerText: string;
    options: ITextBlockOptions;
  }>();

  ngAfterViewInit() {
    const { form } = this.form;
    setTimeout(() => {
      form.patchValue(
        { innerText: this.innerText(), options: this.options() },
        { emitEvent: false }
      );
      form.valueChanges
        .pipe(debounceTime(300), this.takeUntilDestroyed)
        .subscribe(({ innerText, options }) => {
          this.innerText.set(innerText);
          this.options.set(options);
        });
    });
  }
}
