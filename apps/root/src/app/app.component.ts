import { Component, effect, inject, Input, OnInit } from '@angular/core';
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
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { AppService } from './app.service';
import { DomainService } from './domain.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { EmailBuilderStateService } from 'libs/tailwind-email-builder/src/lib/email-builder-state.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    TailwindEmailBuilderModule,
    UIFormModule,
    CdkMenuBar,
    FormsModule,
    CommonModule,
  ],
  selector: 'app-root',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'scale(0.95)', opacity: 0 })
        ),
      ]),
    ]),
  ],
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
        <div
          class="flex items-center gap-2"
          [ngClass]="{ hidden: isPreviewMode }"
        >
          <button
            (click)="goBack()"
            class="bg-red-500 hover:bg-red-600 text-white border px-4 py-1 rounded shadow-sm transition duration-200"
          >
            Cancel
          </button>
          <button
            (click)="undo()"
            [disabled]="!canUndo"
            class="bg-blue-500 hover:bg-blue-600 text-white border px-4 py-1 rounded shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button
            (click)="redo()"
            [disabled]="!canRedo"
            class="bg-green-500 hover:bg-green-600 text-white border px-4 py-1 rounded shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Redo
          </button>
        </div>
        <button
          class="bg-slate-600 hover:bg-slate-700 text-white border px-4 py-1 rounded shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          (click)="saveEmailJson()"
          [disabled]="isSaving"
          [ngClass]="{ hidden: isPreviewMode }"
        >
          <!-- Loader Spinner -->
          <svg
            *ngIf="isSaving"
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isSaving ? 'Saving...' : 'Save Template' }}
        </button>
        <button
          (click)="togglePopup()"
          class="bg-blue-500 hover:bg-blue-600 text-white border px-4 py-1 rounded shadow-sm transition duration-200"
        >
          Send Email
        </button>

        <!-- Global Loading Overlay (Alternative approach) -->
        <div
          *ngIf="isSaving"
          [@fadeInOut]
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            class="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center"
          >
            <svg
              class="animate-spin h-12 w-12 text-blue-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Saving Template
            </h3>
            <p class="text-gray-600 text-center">
              Please wait while we save your email template...
            </p>
          </div>
        </div>

        <!-- Modal Backdrop -->
        <div
          *ngIf="isPopupOpen"
          [@fadeInOut]
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          (click)="closePopupOnBackdropClick($event)"
        >
          <!-- Modal Content -->
          <div
            [@slideInOut]
            class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all"
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Send Email</h3>
              <button
                (click)="togglePopup()"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div class="mt-4">
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Email Address</label
              >
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                (ngModelChange)="validateEmail()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
              />
              <div
                *ngIf="email && !isEmailValid"
                class="text-red-500 text-sm mt-1"
              >
                Please enter a valid email address
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button
                (click)="togglePopup()"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                [disabled]="!isEmailValid"
                (click)="sendEmail()"
                class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
        <!-- Unsaved Changes Confirmation Modal -->
        <div
          *ngIf="showUnsavedChangesModal"
          [@fadeInOut]
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            [@slideInOut]
            class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
          >
            <div class="absolute top-2 right-2">
              <button
                (click)="showUnsavedChangesModal = false"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <h3 class="text-lg font-semibold mb-4 text-gray-900">
              You have made changes to the template.
            </h3>
            <p class="text-gray-700 mb-6">Would you like to save or discard?</p>
            <div class="flex justify-end space-x-4">
              <button
                (click)="discardChanges()"
                class="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Discard
              </button>
              <button
                (click)="saveEmailJson()"
                class="px-4 py-2 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="isSaving"
              >
                <svg
                  *ngIf="isSaving"
                  class="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isSaving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </tail-email-builder>

    <!-- <ng-template #exportMenu>
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
    </ng-template> -->
  `,
})
export class AppComponent implements OnInit {
  readonly currentEmail = injectIIPEmail();
  private emailBuilderStateService = inject(EmailBuilderStateService);
  _activeRoute = inject(ActivatedRoute);
  _appService = inject(AppService);
  _domainService = inject(DomainService);
  templateInfo: { id: string; type: string; domain: string } = {
    id: '',
    type: '',
    domain: '',
  };
  previousEmail: string = '';
  showUnsavedChangesModal = false;

  // Add loading state for save operation
  isSaving = false;

  // Undo/Redo functionality
  private historyStack: string[] = [];
  private currentHistoryIndex: number = -1;
  private maxHistorySize: number = 50; // Limit history to prevent memory issues
  private isUndoRedoOperation: boolean = false; // Flag to prevent history tracking during undo/redo

  get canUndo(): boolean {
    return this.currentHistoryIndex > 0;
  }

  get canRedo(): boolean {
    return this.currentHistoryIndex < this.historyStack.length - 1;
  }

  // Add a getter for the screen state that can be used in the template
  get isPreviewMode() {
    return this.emailBuilderStateService.screen.value === 'preview';
  }

  #effect = effect(() => {
    const email = this.currentEmail.value();
    console.log(email);

    // Only add to history if this is not an undo/redo operation
    if (!this.isUndoRedoOperation) {
      this.addToHistory(JSON.stringify(email));
    }
  });

  ngOnInit() {
    this.getQueryParams();

    this.currentEmail.options({
      name: 'Test Email',
      previewText: '',
    });
    const structureIndex0 = this.currentEmail.structures.add('cols_1', {}, 0);
    const structureIndex1 = this.currentEmail.structures.add('cols_1', {}, 1);
    const structureIndex2 = this.currentEmail.structures.add('cols_2', {}, 2);
    const structureIndex3 = this.currentEmail.structures.add('cols_2', {}, 3);
    const structureIndex4 = this.currentEmail.structures.add('cols_4', {}, 4);
    const structureIndex5 = this.currentEmail.structures.add('cols_1', {}, 5);
    const structureIndex6 = this.currentEmail.structures.add('cols_1', {}, 6);
    this.currentEmail.blocks.add(structureIndex0, 0, 0, {
      type: 'text',
      context: {
        innerText:
          '<p style="text-align: center;">This is sample <strong>Text </strong>for short <span style="color: #2dc26b;">or long <span>description</span></span></p>',
      },
    });
    this.currentEmail.blocks.add(structureIndex1, 0, 1, {
      type: 'image',
    });
    this.currentEmail.blocks.add(structureIndex2, 0, 0, {
      type: 'button',
    });
    this.currentEmail.blocks.add(structureIndex2, 1, 0, {
      type: 'button',
    });
    this.currentEmail.blocks.add(structureIndex3, 0, 0, {
      type: 'image',
    });
    this.currentEmail.blocks.add(structureIndex3, 1, 0, {
      type: 'image',
    });
    this.currentEmail.blocks.add(structureIndex3, 0, 1, {
      type: 'button',
    });
    this.currentEmail.blocks.add(structureIndex3, 1, 1, {
      type: 'button',
    });
    this.currentEmail.blocks.add(structureIndex4, 0, 0, {
      type: 'text',
    });
    this.currentEmail.blocks.add(structureIndex4, 1, 0, {
      type: 'text',
    });
    this.currentEmail.blocks.add(structureIndex4, 2, 0, {
      type: 'text',
    });
    this.currentEmail.blocks.add(structureIndex4, 3, 0, {
      type: 'text',
    });
    this.currentEmail.blocks.add(structureIndex5, 0, 0, {
      type: 'image',
      context: {
        src: 'https://ltsd.thelinksystems.com/images/defaultsignature.png',
      },
    });
    this.currentEmail.blocks.add(structureIndex6, 0, 0, {
      type: 'text',
      context: {
        innerText: '<p style="text-align:center">{{Disclaimer}}</p>',
      },
    });
    this.previousEmail = JSON.stringify(this.currentEmail.value());

    // Initialize history with the initial state
    this.initializeHistory();
  }

  private initializeHistory(): void {
    const initialState = JSON.stringify(this.currentEmail.value());
    this.historyStack = [initialState];
    this.currentHistoryIndex = 0;
  }

  private addToHistory(emailState: string): void {
    // Don't add duplicate states
    if (this.historyStack[this.currentHistoryIndex] === emailState) {
      return;
    }

    // Remove any future history if we're not at the end
    if (this.currentHistoryIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(
        0,
        this.currentHistoryIndex + 1
      );
    }

    // Add new state
    this.historyStack.push(emailState);
    this.currentHistoryIndex++;

    // Limit history size
    if (this.historyStack.length > this.maxHistorySize) {
      this.historyStack.shift();
      this.currentHistoryIndex--;
    }
  }

  undo(): void {
    if (!this.canUndo) return;

    this.currentHistoryIndex--;
    const previousState = this.historyStack[this.currentHistoryIndex];

    this.isUndoRedoOperation = true;
    this.currentEmail.set(JSON.parse(previousState));
    this.isUndoRedoOperation = false;
  }

  redo(): void {
    if (!this.canRedo) return;

    this.currentHistoryIndex++;
    const nextState = this.historyStack[this.currentHistoryIndex];

    this.isUndoRedoOperation = true;
    this.currentEmail.set(JSON.parse(nextState));
    this.isUndoRedoOperation = false;
  }

  getQueryParams() {
    this._activeRoute.queryParams.subscribe((params) => {
      this.templateInfo.id = params['id'];
      this.templateInfo.type = params['type'];
      this.templateInfo.domain = params['domain'];
      if (this.templateInfo.id) {
        this.loadSavedTemplate();
      }
    });
  }

  loadSavedTemplate() {
    this._appService.loadTemplate(this.templateInfo).subscribe({
      next: (res) => {
        this.isUndoRedoOperation = true;
        this.currentEmail.set(JSON.parse(res));
        this.isUndoRedoOperation = false;
        this.previousEmail = JSON.stringify(this.currentEmail.value());
        // Reset history when loading a new template
        this.initializeHistory();
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
        this.isUndoRedoOperation = true;
        this.currentEmail.set(JSON.parse(reader.result as string));
        this.isUndoRedoOperation = false;
        // Reset history when importing
        this.initializeHistory();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error(error);
    } finally {
      (event.target as HTMLInputElement).value = '';
    }
  }

  async saveEmailJson() {
    // Set loading state to true
    this.isSaving = true;

    try {
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
            this.showUnsavedChangesModal = false;
            this.isSaving = false; // Reset loading state
            window.location.href = this._domainService.getManageTemplateUrl();
          },
          error: (err) => {
            console.log(err);
            this.isSaving = false; // Reset loading state on error
            // You might want to show an error message to the user here
          },
        });
    } catch (error) {
      console.error(error);
      this.isSaving = false; // Reset loading state on error
      // You might want to show an error message to the user here
    }
  }

  async sendEmail() {
    const jsonEmail = this.currentEmail.value();
    const { html: htmlEmail, mjml } = await lastValueFrom(
      this.currentEmail.convert()
    );

    const body = JSON.stringify({
      email: jsonEmail,
      html: htmlEmail,
      emailaddress: this.email,
    });
    this._appService.sendEmail(body).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.togglePopup();
  }

  isPopupOpen = false;
  email = '';
  isEmailValid = false;

  togglePopup(): void {
    this.isPopupOpen = !this.isPopupOpen;
    if (!this.isPopupOpen) {
      this.resetForm();
    }
  }

  closePopupOnBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('bg-opacity-50')) {
      this.togglePopup();
    }
  }

  validateEmail(): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isEmailValid = emailRegex.test(this.email);
  }

  resetForm(): void {
    this.email = '';
    this.isEmailValid = false;
  }

  goBack() {
    const current = JSON.stringify(this.currentEmail.value());
    if (this.previousEmail !== current) {
      this.showUnsavedChangesModal = true;
    } else {
      this.redirectToPreviousPage();
    }
  }

  discardChanges() {
    this.showUnsavedChangesModal = false;
    this.redirectToPreviousPage();
  }

  redirectToPreviousPage() {
    window.location.href = this._domainService.getManageTemplateUrl();
  }
}
