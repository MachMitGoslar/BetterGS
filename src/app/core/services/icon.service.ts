import { Injectable } from '@angular/core';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  constructor() {
  addIcons(allIcons);
  }


}
