import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailBuilderStateService {
  readonly screen = new BehaviorSubject<'preview' | null>(null);
}
