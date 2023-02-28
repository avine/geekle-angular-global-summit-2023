import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LibData } from './lib.types';

@Injectable({
  providedIn: 'root',
})
export class LibService {
  private _data$ = new BehaviorSubject<LibData | null>(null);

  data$ = this._data$.asObservable();

  setData(data: LibData) {
    this._data$.next(data);
  }
}
