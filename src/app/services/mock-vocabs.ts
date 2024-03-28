import { Vocab } from './vocab.service';

export var VOCABS: Vocab[] = [
  {
    id: 'VZMX',
    measurementName: [
      {
        locale: 'en',
        name: 'Maximum zero-crossing wave height',
      },
      {
        locale: 'it',
        name: "Massimo zero-crossing dell'altezza delle onde",
      },
    ],
    measurementUnit: 'm',
  },
  {
    id: 'VTMX',
    measurementName: [
      {
        locale: 'en',
        name: 'Maximum wave period',
      },
      {
        locale: 'it',
        name: "Massimo periodo d'onda",
      },
    ],
    measurementUnit: 's',
  },
  {
    id: 'VH110',
    measurementName: [
      {
        locale: 'en',
        name: 'Average height highest wave(1/10)',
      },
      {
        locale: 'it',
        name: "Altezza media dell'onda più alta(1/10)",
      },
    ],
    measurementUnit: 'm',
  },
  {
    id: 'VT110',
    measurementName: [
      {
        locale: 'en',
        name: 'Average period highest wave (T1/10)',
      },
      {
        locale: 'it',
        name: "Periodo medio dell'onda più alta (T1/10)",
      },
    ],
    measurementUnit: 's',
  },
  {
    id: 'VAVH',
    measurementName: [
      {
        locale: 'en',
        name: 'Average height highest 1/3 wave (H1/3)',
      },
      {
        locale: 'it',
        name: "Altezza media dell'onda più alta(H1/3)",
      },
    ],
    measurementUnit: 'm',
  },

  {
    id: 'VAVT',
    measurementName: [
      {
        locale: 'en',
        name: 'Average period highest 1/3 wave',
      },
      {
        locale: 'it',
        name: "Periodo medio dell'onda più alta(1/3)",
      },
    ],
    measurementUnit: 's',
  },
  {
    id: 'VTPK',
    measurementName: [
      {
        locale: 'en',
        name: 'Wave period at spectral peak / peak period',
      },
      {
        locale: 'it',
        name: "Periodo dell'onda alla cima spettrale",
      },
    ],
    measurementUnit: 's',
  },
  {
    id: 'VPED',
    measurementName: [
      {
        locale: 'en',
        name: 'Wave principal direction at spectral peak',
      },
      {
        locale: 'it',
        name: "Direzione dell'onda alla cima spettrale",
      },
    ],
    measurementUnit: '°',
  },
  {
    id: 'VPSP',
    measurementName: [
      {
        locale: 'en',
        name: 'Wave directional spreading at spectral peak',
      },
      {
        locale: 'it',
        name: "Spreading direzionale dell'onda alla cima",
      },
    ],
    measurementUnit: '°',
  },
  {
    id: 'VTZA',
    measurementName: [
      {
        locale: 'en',
        name: 'Average zero crossing wave period',
      },
      {
        locale: 'it',
        name: 'Periodo medio di zero-crossing delle onde',
      },
    ],
    measurementUnit: 's',
  },
  {
    id: 'VHM0',
    measurementName: [
      {
        locale: 'en',
        name: 'Spectral significant wave height (Hm0)',
      },
      {
        locale: 'it',
        name: "Altezza spettrale significante dell'onda",
      },
    ],
    measurementUnit: 'm',
  },
  {
    id: 'WDIR',
    measurementName: [
      {
        locale: 'en',
        name: 'Wind direction',
      },
      {
        locale: 'it',
        name: 'Direzione del vento',
      },
    ],
    measurementUnit: '°',
  },
  {
    id: 'WSPD',
    measurementName: [
      {
        locale: 'en',
        name: 'Wind speed',
      },
      {
        locale: 'it',
        name: 'Velocità del vento',
      },
    ],
    measurementUnit: 'm/s',
  },
  {
    id: 'DRYT',
    measurementName: [
      {
        locale: 'en',
        name: 'Air temperature',
      },
      {
        locale: 'it',
        name: "Temperatura dell'aria",
      },
    ],
    measurementUnit: '°C',
  },
  {
    id: 'ATMS',
    measurementName: [
      {
        locale: 'en',
        name: 'Atmospheric pressure',
      },
      {
        locale: 'it',
        name: 'Pressione atmosferica',
      },
    ],
    measurementUnit: 'hPa',
  },
  {
    id: 'RELH',
    measurementName: [
      {
        locale: 'en',
        name: 'Humidity',
      },
      {
        locale: 'it',
        name: 'Umidità',
      },
    ],
    measurementUnit: '%',
  },
  {
    id: 'GSPD',
    measurementName: [
      {
        locale: 'en',
        name: 'Gust wind speed',
      },
      {
        locale: 'it',
        name: 'Velocità della raffica di vento',
      },
    ],
    measurementUnit: 'm/s',
  },
  {
    id: 'GDIR',
    measurementName: [
      {
        locale: 'en',
        name: 'Gust wind direction',
      },
      {
        locale: 'it',
        name: 'Direzione della raffica di vento',
      },
    ],
    measurementUnit: '°',
  },
  {
    id: 'SINC',
    measurementName: [
      {
        locale: 'en',
        name: 'Shortwave incoming radiation',
      },
      {
        locale: 'it',
        name: 'Radiozioni',
      },
    ],
    measurementUnit: 'W/m²',
  },
  {
    id: 'LINC',
    measurementName: [
      {
        locale: 'en',
        name: 'Longwave incoming radiation',
      },
      {
        locale: 'it',
        name: '**',
      },
    ],
    measurementUnit: 'W/m²',
  },
  {
    id: 'PCO2',
    measurementName: [
      {
        locale: 'en',
        name: 'CO₂ partial pressure',
      },
      {
        locale: 'it',
        name: 'Pressione parziale della CO₂',
      },
    ],
    measurementUnit: 'µatm',
  },
  {
    id: 'PHPH',
    measurementName: [
      {
        locale: 'en',
        name: 'Ph',
      },
      {
        locale: 'it',
        name: 'Ph',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'PHPH_1',
    measurementName: [
      {
        locale: 'en',
        name: 'Ph',
      },
      {
        locale: 'it',
        name: 'Ph',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'PHPH_2',
    measurementName: [
      {
        locale: 'en',
        name: 'Ph',
      },
      {
        locale: 'it',
        name: 'Ph',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'PHPH_3',
    measurementName: [
      {
        locale: 'en',
        name: 'Ph',
      },
      {
        locale: 'it',
        name: 'Ph',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'DOX1',
    measurementName: [
      {
        locale: 'en',
        name: 'Oxygen',
      },
      {
        locale: 'it',
        name: 'Ossigeno',
      },
    ],
    measurementUnit: 'ml/l',
  },
  {
    id: 'DOXY',
    measurementName: [
      {
        locale: 'en',
        name: 'Oxygen',
      },
      {
        locale: 'it',
        name: 'Ossigeno',
      },
    ],
    measurementUnit: 'mmol/m³',
  },
  {
    id: 'DOXY_1',
    measurementName: [
      {
        locale: 'en',
        name: 'Oxygen',
      },
      {
        locale: 'it',
        name: 'Ossigeno',
      },
    ],
    measurementUnit: 'mmol/m³',
  },
  {
    id: 'DOXY_2',
    measurementName: [
      {
        locale: 'en',
        name: 'Oxygen',
      },
      {
        locale: 'it',
        name: 'Ossigeno',
      },
    ],
    measurementUnit: 'mmol/m³',
  },
  {
    id: 'DOXY_3',
    measurementName: [
      {
        locale: 'en',
        name: 'Oxygen',
      },
      {
        locale: 'it',
        name: 'Ossigeno',
      },
    ],
    measurementUnit: 'mmol/m³',
  },
  {
    id: 'TEMP',
    measurementName: [
      {
        locale: 'en',
        name: 'Water temperature',
      },
      {
        locale: 'it',
        name: "Temperatura dell'acqua",
      },
    ],
    measurementUnit: '°C',
  },
  {
    id: 'TEMP_1',
    measurementName: [
      {
        locale: 'en',
        name: 'Water temperature',
      },
      {
        locale: 'it',
        name: "Temperatura dell'acqua",
      },
    ],
    measurementUnit: '°C',
  },
  {
    id: 'TEMP_2',
    measurementName: [
      {
        locale: 'en',
        name: 'Water temperature',
      },
      {
        locale: 'it',
        name: "Temperatura dell'acqua",
      },
    ],
    measurementUnit: '°C',
  },
  {
    id: 'TEMP_3',
    measurementName: [
      {
        locale: 'en',
        name: 'Water temperature',
      },
      {
        locale: 'it',
        name: "Temperatura dell'acqua",
      },
    ],
    measurementUnit: '°C',
  },
  {
    id: 'TEMP_4',
    measurementName: [
      {
        locale: 'en',
        name: 'Water temperature',
      },
      {
        locale: 'it',
        name: "Temperatura dell'acqua",
      },
    ],
    measurementUnit: '°C',
  },
  {
    id: 'CNDC',
    measurementName: [
      {
        locale: 'en',
        name: 'Electrical conductivity',
      },
      {
        locale: 'it',
        name: 'Conducibilità elettrica',
      },
    ],
    measurementUnit: 'S/m',
  },
  {
    id: 'CNDC_1',
    measurementName: [
      {
        locale: 'en',
        name: 'Electrical conductivity',
      },
      {
        locale: 'it',
        name: 'Conducibilità elettrica',
      },
    ],
    measurementUnit: 'S/m',
  },
  {
    id: 'CNDC_2',
    measurementName: [
      {
        locale: 'en',
        name: 'Electrical conductivity',
      },
      {
        locale: 'it',
        name: 'Conducibilità elettrica',
      },
    ],
    measurementUnit: 'S/m',
  },
  {
    id: 'PRES',
    measurementName: [
      {
        locale: 'en',
        name: 'Sea pressure',
      },
      {
        locale: 'it',
        name: 'Pressione del mare',
      },
    ],
    measurementUnit: 'dbar',
  },
  {
    id: 'PRES_1',
    measurementName: [
      {
        locale: 'en',
        name: 'Sea pressure',
      },
      {
        locale: 'it',
        name: 'Pressione del mare',
      },
    ],
    measurementUnit: 'dbar',
  },
  {
    id: 'PRES_2',
    measurementName: [
      {
        locale: 'en',
        name: 'Sea pressure',
      },
      {
        locale: 'it',
        name: 'Pressione del mare',
      },
    ],
    measurementUnit: 'dbar',
  },
  {
    id: 'LGHT',
    measurementName: [
      {
        locale: 'en',
        name: 'Incoming photosynthetic radiation',
      },
      {
        locale: 'it',
        name: 'Radiazione attiva fotosintetica in entrata immersa',
      },
    ],
    measurementUnit: 'µmol/m²s',
  },
  {
    id: 'CPHL',
    measurementName: [
      {
        locale: 'en',
        name: 'Chlorophyll-a',
      },
      {
        locale: 'it',
        name: 'Clorofilla-a',
      },
    ],
    measurementUnit: 'mg/m³',
  },
  {
    id: 'PSAL',
    measurementName: [
      {
        locale: 'en',
        name: 'Salinity',
      },
      {
        locale: 'it',
        name: 'Salinità',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'PSAL_1',
    measurementName: [
      {
        locale: 'en',
        name: 'Salinity',
      },
      {
        locale: 'it',
        name: 'Salinità',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'PSAL_2',
    measurementName: [
      {
        locale: 'en',
        name: 'Salinity',
      },
      {
        locale: 'it',
        name: 'Salinità',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'PSAL_3',
    measurementName: [
      {
        locale: 'en',
        name: 'Salinity',
      },
      {
        locale: 'it',
        name: 'Salinità',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'TUR4',
    measurementName: [
      {
        locale: 'en',
        name: 'Turbidity',
      },
      {
        locale: 'it',
        name: 'Torbidità',
      },
    ],
    measurementUnit: '' /*!!*/,
  },
  {
    id: 'VCSP',
    measurementName: [
      {
        locale: 'en',
        name: 'Bottom-top current component',
      },
      {
        locale: 'it',
        name: '**' /*!!*/,
      },
    ],
    measurementUnit: 'm/s',
  },
  {
    id: 'EWCT',
    measurementName: [
      {
        locale: 'en',
        name: 'West-east current component' /*!!*/,
      },
      {
        locale: 'it',
        name: '**',
      },
    ],
    measurementUnit: 'm/s',
  },
  {
    id: 'NSCT',
    measurementName: [
      {
        locale: 'en',
        name: 'South-north current component' /*!!*/,
      },
      {
        locale: 'it',
        name: '**',
      },
    ],
    measurementUnit: 'm/s',
  },
  {
    id: 'ASLV',
    measurementName: [
      {
        locale: 'en',
        name: 'Observed sea level',
      },
      {
        locale: 'it',
        name: 'Livello osservato del mare',
      },
    ],
    measurementUnit: 'm',
  },
  {
    id: 'RVFL',
    measurementName: [
      {
        locale: 'en',
        name: 'River flow rate',
      },
      {
        locale: 'it',
        name: 'Portata del fiume',
      },
    ],
    measurementUnit: 'm³/s',
  },
  {
    id: 'VSRW',
    measurementName: [
      {
        locale: 'en',
        name: 'irradiance',
      },
      {
        locale: 'it',
        name: 'Irradianza',
      },
    ],
    measurementUnit: 'MicroEinsteins per square metre per second'
  },
  {
    id: 'TMES_1',
    measurementName: [
      {
        locale: 'en',
        name: 'Temperature of pH',
      },
      {
        locale: 'it',
        name: 'Temperatura del pH',
      },
    ],
    measurementUnit: 'Degrees Celsius'
  },
  {
    id: 'TMES_2',
    measurementName: [
      {
        locale: 'en',
        name: 'Temperature of pH',
      },
      {
        locale: 'it',
        name: 'Temperatura del pH',
      },
    ],
    measurementUnit: 'Degrees Celsius'
  },
  {
    id: 'CHUM',
    measurementName: [
      {
        locale: 'en',
        name: 'Partial pressure of water vapour in the atmosphere',
      },
      {
        locale: 'it',
        name: 'Pressione parziale del vapore acqueo nella atmosfera',
      },
    ],
    measurementUnit: 'Parts per million'
  },
  {
    id: 'ACO2',
    measurementName: [
      {
        locale: 'en',
        name: 'Mole fraction of carbon dioxide in the atmosphere',
      },
      {
        locale: 'it',
        name: 'Frazione molare di anidride carbonica nell atmosfera',
      },
    ],
    measurementUnit: 'Parts per million'
  },
  {
    id: 'PCOW',
    measurementName: [
      {
        locale: 'en',
        name: 'Carbon dioxide in water',
      },
      {
        locale: 'it',
        name: 'Anidride carbonica nell acqua',
      },
    ],
    measurementUnit: 'Parts per million'
  },
  {
    id: 'CPWC',
    measurementName: [
      {
        locale: 'en',
        name: 'Concentration of chlorophyll-a',
      },
      {
        locale: 'it',
        name: 'Concentrazione di clorofilla-a',
      },
    ],
    measurementUnit: 'Micrograms per litre'
  },
  {
    id: 'SVEL_1',
    measurementName: [
      {
        locale: 'en',
        name: 'Sound velocity in the water body',
      },
      {
        locale: 'it',
        name: 'Velocità del suono nel corpo idrico',
      },
    ],
    measurementUnit: 'Metres per second'
  },
  {
    id: 'SVEL_2',
    measurementName: [
      {
        locale: 'en',
        name: 'Sound velocity in the water body',
      },
      {
        locale: 'it',
        name: 'Velocità del suono nel corpo idrico',
      },
    ],
    measurementUnit: 'Metres per second'
  },
  {
    id: 'ALKY',
    measurementName: [
      {
        locale: 'en',
        name: 'pH',
      },
      {
        locale: 'it',
        name: 'pH',
      },
    ],
    measurementUnit: 'pH units'
  },
  {
    id: 'EWSB',
    measurementName: [
      {
        locale: 'en',
        name: 'Speed of wind in the atmosphere',
      },
      {
        locale: 'it',
        name: 'Velocità del vento nell atmosfera',
      },
    ],
    measurementUnit: 'Metres per second'
  },
  {
    id: 'HEAD',
    measurementName: [
      {
        locale: 'en',
        name: 'Orientation of measurement platform',
      },
      {
        locale: 'it',
        name: 'Orientamento della piattaforma di misurazione',
      },
    ],
    measurementUnit: 'Degrees'
  },
];