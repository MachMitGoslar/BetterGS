import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({
  name: 'i18n',
  standalone: true,
  pure: false // Make it impure to react to language changes
})
export class I18nPipe implements PipeTransform {

  constructor(private i18nService: I18nService) {}

  transform(key: string, params?: any): string {
    let translation = this.i18nService.getTranslation(key);
    
    // Simple parameter replacement
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }

    return translation;
  }
}
