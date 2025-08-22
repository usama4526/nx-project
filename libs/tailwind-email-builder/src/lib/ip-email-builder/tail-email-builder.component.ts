import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  injectIIPEmail,
  IPActionsService,
  IpPreviewLinkPipe,
} from '@wlocalhost/ngx-email-builder';
import {
  AsyncPipe,
  CommonModule,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { FormBtnDirective } from '../directives/form/form-input.directive';
import { EmailBodyComponent } from '../email-body/email-body.component';
import { EmailAsideComponent } from '../email-aside/email-aside.component';
import { BehaviorSubject, map } from 'rxjs';
import { EmailBuilderStateService } from '../email-builder-state.service';

type TPreviewDevice = 'desktop' | 'tablet' | 'mobile';

@Component({
  selector: 'tail-email-builder',
  templateUrl: './tail-email-builder.component.html',
  styleUrls: ['./tail-email-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgSwitch,
    NgSwitchDefault,
    FormBtnDirective,
    NgSwitchCase,
    EmailBodyComponent,
    EmailAsideComponent,
    AsyncPipe,
    IpPreviewLinkPipe,
    CommonModule,
  ],
})
export class TailEmailBuilderComponent {
  readonly currentEmail = injectIIPEmail();
  /**
   * The middleware service for checking user permissions.
   */
  readonly middlewareService = inject(IPActionsService);
  /**
   * A behavior subject that represents the current screen the user is on.
   */
  get screen() {
    return this.emailBuilderStateService.screen;
  }
  /**
   * A map of device sizes.
   */
  readonly deviceSizes = new Map<TPreviewDevice, string>([
    ['desktop', '100%'],
    ['tablet', '768px'],
    ['mobile', '360px'],
  ]);
  /**
   * The current preview device that the user has selected.
   */
  readonly #previewDevice$ = new BehaviorSubject<TPreviewDevice>('desktop');
  /**
   * A behavior subject that represents the width of the preview device.
   */
  readonly previewDeviceWidth$ = this.#previewDevice$.pipe(
    map((device) => this.deviceSizes.get(device))
  );

  /**
   * Gets the current preview device that the user has selected.
   */
  get previewDevice(): TPreviewDevice {
    return this.#previewDevice$.getValue();
  }

  /**
   * Switches the current screen to the preview screen.
   * Displays an alert if there are no structures to preview.
   */
  // Inject the shared service
  private emailBuilderStateService = inject(EmailBuilderStateService);

  preview(): void {
    if (!this.currentEmail.value().structures.length) {
      this.middlewareService.alert(
        $localize`:@@convert_empty_body:Add some structures before save.`
      );
    } else {
      this.screen.next('preview');
    }
  }

  /**
   * Update the preview device to the given {@link TPreviewDevice}.
   * @param device The preview device to update to.
   * @returns void
   */
  changePreviewDevice(device: TPreviewDevice): void {
    this.#previewDevice$.next(device);
  }
}
