import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  ViewChild,
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
import { CommonModule } from '@angular/common';

// Add GrabzIt type declaration (you'll need to include GrabzIt script in your index.html)
declare var GrabzIt: any;

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
    CommonModule,
  ],
})
export class ImageUploadComponent implements OnInit {
  @ViewChild('imageUploadRef') imageUploadRef!: ElementRef<HTMLInputElement>;
  _activeRoute = inject(ActivatedRoute);
  _imageUploadService = inject(ImageUploadService);
  _cdr = inject(ChangeDetectorRef);
  readonly ngModelName = input<string>('url');
  readonly isBackgroundImage = input(true, {
    transform: coerceBooleanProperty,
  });

  isUploading: boolean = false;
  isProcessingVideo: boolean = false;
  videoUrl: string = '';
  thumbnailType: string = 'undefined';
  @Output() linkForVideo = new EventEmitter<string>();

  // Cache for storing converted results
  private videoCache: Map<string, { gif?: string; image?: string }> = new Map();

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
  showDialog = false;
  imageUrl: string = '';

  uploadImage(event: Event) {
    const eventTarget = event.target as HTMLInputElement;
    if (!eventTarget.files || eventTarget.files.length === 0) return;

    this.isUploading = true;

    const formData = new FormData();
    formData.append('image', eventTarget.files[0]);
    formData.append('id', this.templateInfo.id);
    formData.append('type', this.templateInfo.type);
    formData.append('domain', this.templateInfo.domain);

    this._imageUploadService.uploadImage(formData).subscribe({
      next: (res) => {
        const url = res.replace('http', 'https');
        this.imageUrl = url;
        this.isUploading = false;

        if (this.imageUploadRef && this.imageUploadRef.nativeElement) {
          this.imageUploadRef.nativeElement.value = '';
        }

        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.isUploading = false;
        this._cdr.detectChanges();
      },
    });
  }

  convertToSignature() {
    this.imageUrl =
      'https://ltsd.thelinksystems.com/images/defaultsignature.png';
  }
  openConfirmDialog() {
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
  }
  confirmConversion() {
    // Perform the actual conversion
    this.convertToSignature();

    // Close the dialog
    this.closeDialog();
  }

  applyVideoChanges() {
    if (!this.videoUrl || this.thumbnailType === 'undefined') {
      alert('Please enter a video URL and select a thumbnail type');
      return;
    }
    this.linkForVideo.emit(this.videoUrl);
    // Check if we have cached result for this video URL and type
    const cacheKey = this.videoUrl.trim().toLowerCase();
    const cachedData = this.videoCache.get(cacheKey);

    if (cachedData) {
      if (this.thumbnailType === 'gif' && cachedData.gif) {
        console.log('Using cached GIF');
        this.imageUrl = cachedData.gif;
        this._cdr.detectChanges();
        return;
      } else if (this.thumbnailType === 'image' && cachedData.image) {
        console.log('Using cached image thumbnail');
        this.imageUrl = cachedData.image;
        this._cdr.detectChanges();
        return;
      }
    }

    // No cached result found, proceed with conversion/extraction
    this.isProcessingVideo = true;

    if (this.thumbnailType === 'gif') {
      this.convertVideoToGif();
    } else if (this.thumbnailType === 'image') {
      this.extractStaticThumbnail();
    }
  }

  private convertVideoToGif() {
    // Make sure GrabzIt is loaded
    if (typeof GrabzIt === 'undefined') {
      console.error('GrabzIt is not loaded');
      this.isProcessingVideo = false;
      this._cdr.detectChanges();
      return;
    }

    GrabzIt('Mzg4OTlmMDQzZTYxNDYxZWE4Y2RkN2NmNWRiYjg3Y2M=')
      .ConvertURL(this.videoUrl, {
        format: 'gif',
        quality: 100,
        displayid: 'gif',
        duration: 10,
        repeat: 0,
        start: 20,
        width: 360,
        height: 240,
        fps: 24,
        onstart: () => {
          console.log('Starting GIF conversion...');
          this.setupGifObserver();
        },
        onfinish: () => {
          console.log('GIF conversion completed');
          const gifElement = document.getElementById('gif') as HTMLImageElement;
          if (gifElement && gifElement.src) {
            this.imageUrl = gifElement.src;

            // Cache the GIF result
            this.cacheVideoResult('gif', gifElement.src);

            this.isProcessingVideo = false;
            this._cdr.detectChanges();
          }
        },
        onerror: () => {
          console.error('GIF conversion failed');
          this.isProcessingVideo = false;
          this._cdr.detectChanges();
        },
      })
      .Create();
  }

  private setupGifObserver() {
    const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
      mutationsList.forEach((mutation: MutationRecord) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((addedNode: Node) => {
            // Check if the added node is an element and has the id "gif"
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              const element = addedNode as HTMLElement;
              if (element.id === 'gif') {
                // Hide the GIF element immediately
                element.style.display = 'none';
                // Disconnect the observer as we found what we were looking for
                observer.disconnect();
                console.log('GIF element hidden successfully');
              }
            }
          });
        }
      });
    });

    // Start observing the document body for added child nodes
    observer.observe(document.body, {
      childList: true,
      subtree: false,
    });

    // Safety cleanup: disconnect observer after 30 seconds to prevent memory leaks
    setTimeout(() => {
      observer.disconnect();
      console.log('GIF observer disconnected after timeout');
    }, 60000);
  }

  private cacheVideoResult(type: 'gif' | 'image', url: string) {
    const cacheKey = this.videoUrl.trim().toLowerCase();
    const existingCache = this.videoCache.get(cacheKey) || {};

    existingCache[type] = url;
    this.videoCache.set(cacheKey, existingCache);

    console.log(`Cached ${type} result for URL: ${cacheKey}`);
  }

  private getCachedResult(type: 'gif' | 'image'): string | null {
    const cacheKey = this.videoUrl.trim().toLowerCase();
    const cachedData = this.videoCache.get(cacheKey);

    return cachedData?.[type] || null;
  }

  // Optional: Method to clear cache if needed
  clearVideoCache() {
    this.videoCache.clear();
    console.log('Video cache cleared');
  }

  // Optional: Method to get cache status for debugging
  getCacheStatus() {
    const cacheKey = this.videoUrl.trim().toLowerCase();
    const cachedData = this.videoCache.get(cacheKey);

    return {
      hasCache: !!cachedData,
      hasGif: !!cachedData?.gif,
      hasImage: !!cachedData?.image,
      cacheSize: this.videoCache.size,
    };
  }

  private extractStaticThumbnail() {
    // Check if it's a Vimeo URL
    const vimeoMatch = /vimeo.*\/(\d+)/i.exec(this.videoUrl);

    if (vimeoMatch) {
      this.extractVimeoThumbnail();
    } else {
      this.extractYouTubeThumbnail();
    }
  }

  private extractVimeoThumbnail() {
    let vimeoId = '';

    // For your specific URL format: https://vimeo.com/groups/114/videos/1017406920
    const groupsMatch = this.videoUrl.match(
      /vimeo\.com\/groups\/\d+\/videos\/(\d+)/
    );
    if (groupsMatch) {
      vimeoId = groupsMatch[1];
    } else {
      // Fallback to standard vimeo.com/ID format
      const standardMatch = this.videoUrl.match(/vimeo\.com\/(\d+)/);
      if (standardMatch) {
        vimeoId = standardMatch[1];
      }
    }

    if (vimeoId) {
      const thumbnailUrl = `https://vumbnail.com/${vimeoId}_large.jpg`;
      this.imageUrl = thumbnailUrl;
      this.cacheVideoResult('image', thumbnailUrl);
    }

    this.isProcessingVideo = false;
    this._cdr.detectChanges();
  }

  private extractYouTubeThumbnail() {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = this.videoUrl.match(regExp);

    if (match && match[2].length === 11) {
      const thumbnailUrl = `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
      this.imageUrl = thumbnailUrl;

      // Cache the image result
      this.cacheVideoResult('image', thumbnailUrl);

      this.isProcessingVideo = false;
      this._cdr.detectChanges();
    } else {
      console.error('Invalid YouTube URL');
      this.isProcessingVideo = false;
      this._cdr.detectChanges();
    }
  }
}
