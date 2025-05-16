import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { formViewProvider } from '../../directives/form-providers';
import {
  FormInputDirective,
  FormLabelDirective,
} from '../../directives/form/form-input.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ImageUploadService } from './image-upload.service';

@Component({
  selector: 'tail-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [formViewProvider()],
  imports: [
    FormLabelDirective,
    ReactiveFormsModule,
    FormInputDirective,
    FormsModule,
  ],
})
export class ImageUploadComponent implements OnInit {
  _activeRoute = inject(ActivatedRoute);
  _imageUploadService = inject(ImageUploadService);
  _cdr = inject(ChangeDetectorRef);
  readonly ngModelName = input<string>('url');
  readonly isBackgroundImage = input(true, {
    transform: coerceBooleanProperty,
  });

  templateInfo: { id: string; type: string; domain: string } = {
    id: '',
    type: '',
    domain: '',
  };
  ngOnInit(): void {
    this._activeRoute.queryParams.subscribe((params) => {
      this.templateInfo.id = params['id'];
      this.templateInfo.type = params['type'];
      this.templateInfo.domain = params['domain'];
      console.log(this.templateInfo);
    });
  }

  imageUrl: string = '';

  uploadImage(event: Event) {
    let eventTarget = event.target as HTMLInputElement;
    if (!eventTarget.files) return;
    console.log(event);
    const formData = new FormData();
    formData.append('image', eventTarget.files[0]);
    formData.append('id', this.templateInfo.id);
    formData.append('type', this.templateInfo.type);
    formData.append('domain', this.templateInfo.domain);

    this._imageUploadService.uploadImage(formData).subscribe({
      next: (res) => {
        const url = res.replace('http', 'https');
        this.imageUrl = url;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
