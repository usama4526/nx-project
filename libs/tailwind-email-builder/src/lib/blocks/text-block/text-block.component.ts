import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  addIPEmailBuilderBlock,
  AIPEmailBuilderBlock,
  createLineHeight,
  createPadding,
  IFont,
  ILineHeight,
  injectIPFonts,
  IPadding,
  IPEmailBuilderSettingsDirective,
} from '@wlocalhost/ngx-email-builder';
import { FormsModule } from '@angular/forms';
import { UIFormModule } from '../../directives/form/form-input.directive';
import { TextSettingsComponent } from './text-settings.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface ITextBlockOptions {
  color: string;
  font: IFont;
  lineHeight: ILineHeight;
  padding: IPadding;
}

@Component({
  selector: 'tail-text-block',
  templateUrl: 'text-block.component.html',
  styleUrls: ['text-block.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IPEmailBuilderSettingsDirective,
    UIFormModule,
    TextSettingsComponent,
  ],
})
export class TextBlockComponent
  extends AIPEmailBuilderBlock<ITextBlockOptions>
  implements OnInit
{
  readonly sanitizer = inject(DomSanitizer);
  readonly innerText = model.required<string>();
  readonly options = model.required<ITextBlockOptions>();
  readonly fontParser = injectIPFonts();

  readonly hostStyles = computed(() => {
    const { color, font, lineHeight, padding } = this.options();

    return {
      color,
      'word-break': 'break-all',
      ...createLineHeight(lineHeight),
      ...this.fontParser.parser.createFont(font),
      ...createPadding(padding),
    };
  });

  ngOnInit() {
    this.innerText.subscribe((innerText) => {
      this.updateMyContext({ innerText });
    });
    this.options.subscribe((options) => {
      this.updateMyContext({ options });
    });
  }
  readonly safeInnerText = computed<SafeHtml>(() => {
    return this.sanitizer.bypassSecurityTrustHtml(this.innerText());
  });
}

export const TextBlock = addIPEmailBuilderBlock<ITextBlockOptions>(
  $localize`:@@block_text_title:Text`,
  {
    type: 'text',
    component: TextBlockComponent,
    context: {
      innerText:
        '<p style="text-align: center;">This is sample <strong>Text </strong>for short <span style="color: #2dc26b;">or long <span>description</span></span></p>',
      options: {
        color: '#000000',
        font: {
          fallback: 'Arial, Helvetica, sans-serif',
          family: 'Roboto',
          style: 'normal',
          size: 16,
          weight: 400,
        },
        lineHeight: {
          value: 16,
          unit: 'none',
        },
        padding: {
          top: 10,
          right: 25,
          bottom: 10,
          left: 25,
        },
      },
    },
  }
);
