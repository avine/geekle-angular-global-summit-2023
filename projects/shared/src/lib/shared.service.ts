import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SharedData } from './shared.types';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private _data$ = new BehaviorSubject<SharedData | null>(null);

  data$ = this._data$.asObservable();

  setData(data: SharedData) {
    this._data$.next(data);
  }
}
