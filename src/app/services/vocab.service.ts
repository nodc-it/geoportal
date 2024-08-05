import { Injectable } from '@angular/core';
import { VOCABS } from './mock-vocabs';

export interface Vocab {
  id: string;
  device: string;
  measurementName: { locale: string; name: string }[];
  measurementUnit: string;
}

@Injectable({
  providedIn: 'root',
})
export class VocabService {
  defaultLocale = 'en';

  constructor() {}

  getMeasurementName(m_device: string, id: string, locale: string = this.defaultLocale): string | undefined {
    let measurementName = VOCABS.find(x => ((x.id == id) && (x.device == m_device)))?.measurementName;
    if (measurementName?.find(y => y.locale == locale) === undefined)
      return measurementName?.find(y => y.locale == this.defaultLocale)?.name;
    else return measurementName.find(y => y.locale == locale)?.name;
  }

  getMeasurementUnit(m_device: string, id: string): string | undefined {
    return VOCABS.find(x => ((x.id == id) && (x.device == m_device)))?.measurementUnit;
  }
}
