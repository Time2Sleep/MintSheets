export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const CURRENCIES: Currency[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US dollars',
  },
  {
    code: 'CAD',
    symbol: '$',
    name: 'Canadian dollars',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euros',
  },
  {
    code: 'AED',
    symbol: 'د.إ.',
    name: 'UAE dirhams',
  },
  {
    code: 'AFN',
    symbol: '؋',
    name: 'Afghan Afghanis',
  },
  {
    code: 'ALL',
    symbol: 'Lek',
    name: 'Albanian lekë',
  },
  {
    code: 'AMD',
    symbol: 'դր.',
    name: 'Armenian drams',
  },
  {
    code: 'ARS',
    symbol: '$',
    name: 'Argentine pesos',
  },
  {
    code: 'AUD',
    symbol: '$',
    name: 'Australian dollars',
  },
  {
    code: 'AZN',
    symbol: 'ман.',
    name: 'Azerbaijani manats',
  },
  {
    code: 'BAM',
    symbol: 'KM',
    name: 'Bosnia-Herzegovina convertible marks',
  },
  {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi takas',
  },
  {
    code: 'BGN',
    symbol: 'лв.',
    name: 'Bulgarian leva',
  },
  {
    code: 'BHD',
    symbol: 'د.ب.',
    name: 'Bahraini dinars',
  },
  {
    code: 'BIF',
    symbol: 'FBu',
    name: 'Burundian francs',
  },
  {
    code: 'BND',
    symbol: '$',
    name: 'Brunei dollars',
  },
  {
    code: 'BOB',
    symbol: 'Bs',
    name: 'Bolivian bolivianos',
  },
  {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian reals',
  },
  {
    code: 'BWP',
    symbol: 'P',
    name: 'Botswanan pulas',
  },
  {
    code: 'BYN',
    symbol: 'руб.',
    name: 'Belarusian rubles',
  },
  {
    code: 'BZD',
    symbol: '$',
    name: 'Belize dollars',
  },
  {
    code: 'CDF',
    symbol: 'FrCD',
    name: 'Congolese francs',
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss francs',
  },
  {
    code: 'CLP',
    symbol: '$',
    name: 'Chilean pesos',
  },
  {
    code: 'CNY',
    symbol: 'CN¥',
    name: 'Chinese yuan',
  },
  {
    code: 'COP',
    symbol: '$',
    name: 'Colombian pesos',
  },
  {
    code: 'CRC',
    symbol: '₡',
    name: 'Costa Rican colóns',
  },
  {
    code: 'CVE',
    symbol: 'CV$',
    name: 'Cape Verdean escudos',
  },
  {
    code: 'CZK',
    symbol: 'Kč',
    name: 'Czech Republic korunas',
  },
  {
    code: 'DJF',
    symbol: 'Fdj',
    name: 'Djiboutian francs',
  },
  {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish kroner',
  },
  {
    code: 'DOP',
    symbol: 'RD$',
    name: 'Dominican pesos',
  },
  {
    code: 'DZD',
    symbol: 'د.ج.',
    name: 'Algerian dinars',
  },
  {
    code: 'EEK',
    symbol: 'kr',
    name: 'Estonian kroons',
  },
  {
    code: 'EGP',
    symbol: 'ج.م.',
    name: 'Egyptian pounds',
  },
  {
    code: 'ERN',
    symbol: 'Nfk',
    name: 'Eritrean nakfas',
  },
  {
    code: 'ETB',
    symbol: 'Br',
    name: 'Ethiopian birrs',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British pounds sterling',
  },
  {
    code: 'GEL',
    symbol: 'GEL',
    name: 'Georgian laris',
  },
  {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian cedis',
  },
  {
    code: 'GNF',
    symbol: 'FG',
    name: 'Guinean francs',
  },
  {
    code: 'GTQ',
    symbol: 'Q',
    name: 'Guatemalan quetzals',
  },
  {
    code: 'HKD',
    symbol: '$',
    name: 'Hong Kong dollars',
  },
  {
    code: 'HNL',
    symbol: 'L',
    name: 'Honduran lempiras',
  },
  {
    code: 'HRK',
    symbol: 'kn',
    name: 'Croatian kunas',
  },
  {
    code: 'HUF',
    symbol: 'Ft',
    name: 'Hungarian forints',
  },
  {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian rupiahs',
  },
  {
    code: 'ILS',
    symbol: '₪',
    name: 'Israeli new sheqels',
  },
  {
    code: 'INR',
    symbol: 'টকা',
    name: 'Indian rupees',
  },
  {
    code: 'IQD',
    symbol: 'د.ع.',
    name: 'Iraqi dinars',
  },
  {
    code: 'IRR',
    symbol: '﷼',
    name: 'Iranian rials',
  },
  {
    code: 'ISK',
    symbol: 'kr',
    name: 'Icelandic krónur',
  },
  {
    code: 'JMD',
    symbol: '$',
    name: 'Jamaican dollars',
  },
  {
    code: 'JOD',
    symbol: 'د.أ.',
    name: 'Jordanian dinars',
  },
  {
    code: 'JPY',
    symbol: '￥',
    name: 'Japanese yen',
  },
  {
    code: 'KES',
    symbol: 'Ksh',
    name: 'Kenyan shillings',
  },
  {
    code: 'KHR',
    symbol: '៛',
    name: 'Cambodian riels',
  },
  {
    code: 'KMF',
    symbol: 'FC',
    name: 'Comorian francs',
  },
  {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean won',
  },
  {
    code: 'KWD',
    symbol: 'د.ك.',
    name: 'Kuwaiti dinars',
  },
  {
    code: 'KZT',
    symbol: 'тңг.',
    name: 'Kazakhstani tenges',
  },
  {
    code: 'LBP',
    symbol: 'ل.ل.',
    name: 'Lebanese pounds',
  },
  {
    code: 'LKR',
    symbol: 'SL Re',
    name: 'Sri Lankan rupees',
  },
  {
    code: 'LTL',
    symbol: 'Lt',
    name: 'Lithuanian litai',
  },
  {
    code: 'LVL',
    symbol: 'Ls',
    name: 'Latvian lati',
  },
  {
    code: 'LYD',
    symbol: 'د.ل.',
    name: 'Libyan dinars',
  },
  {
    code: 'MAD',
    symbol: 'د.م.',
    name: 'Moroccan dirhams',
  },
  {
    code: 'MDL',
    symbol: 'MDL',
    name: 'Moldovan lei',
  },
  {
    code: 'MGA',
    symbol: 'MGA',
    name: 'Malagasy Ariaries',
  },
  {
    code: 'MKD',
    symbol: 'MKD',
    name: 'Macedonian denari',
  },
  {
    code: 'MMK',
    symbol: 'K',
    name: 'Myanma kyats',
  },
  {
    code: 'MOP',
    symbol: 'MOP$',
    name: 'Macanese patacas',
  },
  {
    code: 'MUR',
    symbol: 'MURs',
    name: 'Mauritian rupees',
  },
  {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican pesos',
  },
  {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian ringgits',
  },
  {
    code: 'MZN',
    symbol: 'MTn',
    name: 'Mozambican meticals',
  },
  {
    code: 'NAD',
    symbol: 'N$',
    name: 'Namibian dollars',
  },
  {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian nairas',
  },
  {
    code: 'NIO',
    symbol: 'C$',
    name: 'Nicaraguan córdobas',
  },
  {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian kroner',
  },
  {
    code: 'NPR',
    symbol: 'नेरू',
    name: 'Nepalese rupees',
  },
  {
    code: 'NZD',
    symbol: '$',
    name: 'New Zealand dollars',
  },
  {
    code: 'OMR',
    symbol: 'ر.ع.',
    name: 'Omani rials',
  },
  {
    code: 'PAB',
    symbol: 'B/.',
    name: 'Panamanian balboas',
  },
  {
    code: 'PEN',
    symbol: 'S/.',
    name: 'Peruvian nuevos soles',
  },
  {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine pesos',
  },
  {
    code: 'PKR',
    symbol: '₨',
    name: 'Pakistani rupees',
  },
  {
    code: 'PLN',
    symbol: 'zł',
    name: 'Polish zlotys',
  },
  {
    code: 'PYG',
    symbol: '₲',
    name: 'Paraguayan guaranis',
  },
  {
    code: 'QAR',
    symbol: 'ر.ق.',
    name: 'Qatari rials',
  },
  {
    code: 'RON',
    symbol: 'RON',
    name: 'Romanian lei',
  },
  {
    code: 'RSD',
    symbol: 'дин.',
    name: 'Serbian dinars',
  },
  {
    code: 'RUB',
    symbol: '₽.',
    name: 'Russian rubles',
  },
  {
    code: 'RWF',
    symbol: 'FR',
    name: 'Rwandan francs',
  },
  {
    code: 'SAR',
    symbol: 'ر.س.',
    name: 'Saudi riyals',
  },
  {
    code: 'SDG',
    symbol: 'SDG',
    name: 'Sudanese pounds',
  },
  {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish kronor',
  },
  {
    code: 'SGD',
    symbol: '$',
    name: 'Singapore dollars',
  },
  {
    code: 'SOS',
    symbol: 'Ssh',
    name: 'Somali shillings',
  },
  {
    code: 'SYP',
    symbol: 'ل.س.',
    name: 'Syrian pounds',
  },
  {
    code: 'THB',
    symbol: '฿',
    name: 'Thai baht',
  },
  {
    code: 'TND',
    symbol: 'د.ت.',
    name: 'Tunisian dinars',
  },
  {
    code: 'TOP',
    symbol: 'T$',
    name: "Tongan pa'anga",
  },
  {
    code: 'TRY',
    symbol: 'TL',
    name: 'Turkish Lira',
  },
  {
    code: 'TTD',
    symbol: '$',
    name: 'Trinidad and Tobago dollars',
  },
  {
    code: 'TWD',
    symbol: 'NT$',
    name: 'New Taiwan dollars',
  },
  {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian shillings',
  },
  {
    code: 'UAH',
    symbol: '₴',
    name: 'Ukrainian hryvnias',
  },
  {
    code: 'UGX',
    symbol: 'USh',
    name: 'Ugandan shillings',
  },
  {
    code: 'UYU',
    symbol: '$',
    name: 'Uruguayan pesos',
  },
  {
    code: 'UZS',
    symbol: 'UZS',
    name: 'Uzbekistan som',
  },
  {
    code: 'VEF',
    symbol: 'Bs.F.',
    name: 'Venezuelan bolívars',
  },
  {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese dong',
  },
  {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'CFA francs BEAC',
  },
  {
    code: 'XOF',
    symbol: 'CFA',
    name: 'CFA francs BCEAO',
  },
  {
    code: 'YER',
    symbol: 'ر.ي.',
    name: 'Yemeni rials',
  },
  {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African rand',
  },
  {
    code: 'ZMK',
    symbol: 'ZK',
    name: 'Zambian kwachas',
  },
  {
    code: 'ZWL',
    symbol: 'ZWL$',
    name: 'Zimbabwean Dollar',
  },
];

CURRENCIES.reduce((acc, item) => ({ [item['name']]: item['symbol'], ...acc }), {});
