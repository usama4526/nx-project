import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { debounceTime, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BorderComponent } from '../../settings/border/border.component';
import { ColorComponent } from '../../settings/color/color.component';
import { FontComponent } from '../../settings/font/font.component';
import { UIFormModule } from '../../directives/form/form-input.directive';
import { IButtonBlockOptions } from './button-block.component';
import { formViewProvider } from '../../directives/form-providers';
import { PaddingComponent } from '../../settings/padding/padding.component';
import { AlignComponent } from '../../settings/align/align.component';
import { LinkComponent } from '../../settings/link/link.component';
import { LineHeightComponent } from '../../settings/line-height/line-height.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tail-button-settings',
  template: `
    <h2 tailH2 i18n="@@button_block_text">Button text</h2>
    <div tailPanel>
      <input type="text" tailInput name="innerText" required ngModel />
    </div>
    <ng-container ngModelGroup="options">
      <h2 tailH2 i18n="@@font">Font</h2>
      <div tailPanel>
        <tail-font />
        <tail-line-height class="pt-2" />
      </div>
      <h2 tailH2 i18n="@@button_color">Button Color</h2>
      <div tailPanel>
        <tail-color allowTransparent="false" />
      </div>
      <h2 tailH2 i18n="@@button_block_background_color">Background color</h2>
      <div tailPanel>
        <tail-color ngModelName="backgroundColor" />
      </div>
      <h2 
        tailH2 
        i18n="@@border" 
        class="cursor-pointer flex items-center justify-between hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
        (click)="toggleBorderSection()"
      >
        <span>Border</span>
        <svg 
          class="h-4 w-4 transition-transform duration-200" 
          [class.rotate-180]="!isBorderExpanded"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </h2>
      <div tailPanel [hidden]="!isBorderExpanded">
        <tail-border />
      </div>
      <h2 
        tailH2 
        i18n="@@button_block_attributes" 
        class="cursor-pointer flex items-center justify-between hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
        (click)="toggleAttributesSection()"
      >
        <span>Attributes</span>
        <svg 
          class="h-4 w-4 transition-transform duration-200" 
          [class.rotate-180]="!isAttributesExpanded"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </h2>
      <div tailPanel [hidden]="!isAttributesExpanded">
        <div class="grid grid-cols-3 gap-2">
          <tail-align class="col-span-2" mode="horizontal" />
          <button tailBtn (click)="options().fullWidth = !options().fullWidth" [class.active]="options().fullWidth"
                  i18n="@@button_block_full_width">
            Full Width
          </button>
        </div>
        <tail-link class="pt-2" />
        <div class="flex flex-col pt-2">
          <h3 tailH3 i18n="@@button_block_inner_padding">Inner Padding</h3>
          <tail-padding modelGroupName="innerPadding" />
        </div>
        <div class="flex flex-col pt-2">
          <h3 tailH3 i18n="@@padding">Padding</h3>
          <tail-padding />
        </div>
      </div>
    </ng-container>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BorderComponent,
    ColorComponent,
    FontComponent,
    UIFormModule,
    FormsModule,
    PaddingComponent,
    AlignComponent,
    LinkComponent,
    LineHeightComponent,
    CommonModule
  ],
  viewProviders: [formViewProvider()],
})
export class ButtonSettingsComponent implements AfterViewInit {
  readonly options = model.required<IButtonBlockOptions>();
  readonly innerText = model.required<string>();

  readonly form = inject(NgForm);
  readonly untilDestroyed = takeUntilDestroyed<{
    options: IButtonBlockOptions;
    innerText: string;
  }>();

  // Collapsible sections state
  isBorderExpanded = false;
  isAttributesExpanded = false;

  toggleBorderSection() {
    this.isBorderExpanded = !this.isBorderExpanded;
  }

  toggleAttributesSection() {
    this.isAttributesExpanded = !this.isAttributesExpanded;
  }

  ngAfterViewInit() {
    const { form } = this.form;
    setTimeout(() => {
      form.patchValue(
        { options: this.options(), innerText: this.innerText() },
        { emitEvent: false }
      );
      form.valueChanges
        .pipe(
          filter(() => form.valid),
          debounceTime(300),
          this.untilDestroyed
        )
        .subscribe((value) => {
          this.innerText.set(value.innerText);
          this.options.set(value.options);
        });
    });
  }
}
