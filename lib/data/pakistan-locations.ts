// Pakistani cities and shipping zones configuration

export interface PakistanCity {
  id: string
  name: string
  province: string
  postal_code_prefix: string
  is_major_city: boolean
  shipping_zone: 'metro' | 'urban' | 'rural'
  estimated_delivery_days: number
}

export const PAKISTAN_CITIES: PakistanCity[] = [
  // Punjab Province
  {
    id: 'pk-lhr',
    name: 'Lahore',
    province: 'Punjab',
    postal_code_prefix: '54',
    is_major_city: true,
    shipping_zone: 'metro',
    estimated_delivery_days: 1
  },
  {
    id: 'pk-kar',
    name: 'Karachi',
    province: 'Sindh',
    postal_code_prefix: '75',
    is_major_city: true,
    shipping_zone: 'metro',
    estimated_delivery_days: 1
  },
  {
    id: 'pk-isl',
    name: 'Islamabad',
    province: 'Federal Capital Territory',
    postal_code_prefix: '44',
    is_major_city: true,
    shipping_zone: 'metro',
    estimated_delivery_days: 1
  },
  {
    id: 'pk-rwp',
    name: 'Rawalpindi',
    province: 'Punjab',
    postal_code_prefix: '46',
    is_major_city: true,
    shipping_zone: 'metro',
    estimated_delivery_days: 1
  },
  {
    id: 'pk-fsd',
    name: 'Faisalabad',
    province: 'Punjab',
    postal_code_prefix: '38',
    is_major_city: true,
    shipping_zone: 'metro',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-mul',
    name: 'Multan',
    province: 'Punjab',
    postal_code_prefix: '60',
    is_major_city: true,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-hyd',
    name: 'Hyderabad',
    province: 'Sindh',
    postal_code_prefix: '71',
    is_major_city: true,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-guj',
    name: 'Gujranwala',
    province: 'Punjab',
    postal_code_prefix: '52',
    is_major_city: true,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-pes',
    name: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    postal_code_prefix: '25',
    is_major_city: true,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-que',
    name: 'Quetta',
    province: 'Balochistan',
    postal_code_prefix: '87',
    is_major_city: true,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-skt',
    name: 'Sialkot',
    province: 'Punjab',
    postal_code_prefix: '51',
    is_major_city: true,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-bwp',
    name: 'Bahawalpur',
    province: 'Punjab',
    postal_code_prefix: '63',
    is_major_city: true,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-sar',
    name: 'Sargodha',
    province: 'Punjab',
    postal_code_prefix: '40',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-skr',
    name: 'Sukkur',
    province: 'Sindh',
    postal_code_prefix: '65',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-lrk',
    name: 'Larkana',
    province: 'Sindh',
    postal_code_prefix: '77',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-shk',
    name: 'Sheikhupura',
    province: 'Punjab',
    postal_code_prefix: '39',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-jhg',
    name: 'Jhang',
    province: 'Punjab',
    postal_code_prefix: '35',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-rah',
    name: 'Rahim Yar Khan',
    province: 'Punjab',
    postal_code_prefix: '64',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-glt',
    name: 'Gilgit',
    province: 'Gilgit-Baltistan',
    postal_code_prefix: '15',
    is_major_city: false,
    shipping_zone: 'rural',
    estimated_delivery_days: 5
  },
  {
    id: 'pk-mrd',
    name: 'Mardan',
    province: 'Khyber Pakhtunkhwa',
    postal_code_prefix: '23',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-mng',
    name: 'Mingora',
    province: 'Khyber Pakhtunkhwa',
    postal_code_prefix: '19',
    is_major_city: false,
    shipping_zone: 'rural',
    estimated_delivery_days: 4
  },
  {
    id: 'pk-abb',
    name: 'Abbottabad',
    province: 'Khyber Pakhtunkhwa',
    postal_code_prefix: '22',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-ksk',
    name: 'Kasur',
    province: 'Punjab',
    postal_code_prefix: '55',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-okr',
    name: 'Okara',
    province: 'Punjab',
    postal_code_prefix: '56',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-wah',
    name: 'Wah Cantonment',
    province: 'Punjab',
    postal_code_prefix: '47',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-ding',
    name: 'Dera Ghazi Khan',
    province: 'Punjab',
    postal_code_prefix: '32',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-sahiwal',
    name: 'Sahiwal',
    province: 'Punjab',
    postal_code_prefix: '57',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-nwshera',
    name: 'Nowshera',
    province: 'Khyber Pakhtunkhwa',
    postal_code_prefix: '24',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 3
  },
  {
    id: 'pk-mirpur',
    name: 'Mirpur',
    province: 'Azad Kashmir',
    postal_code_prefix: '10',
    is_major_city: false,
    shipping_zone: 'rural',
    estimated_delivery_days: 4
  },
  {
    id: 'pk-chiniot',
    name: 'Chiniot',
    province: 'Punjab',
    postal_code_prefix: '35',
    is_major_city: false,
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  },
  {
    id: 'pk-mzg',
    name: 'Muzaffargarh',
    province: 'Punjab',
    postal_code_prefix: '34',
    is_major_city: true, // Important city as your business location
    shipping_zone: 'urban',
    estimated_delivery_days: 2
  }
]

// Pakistan provinces for easier management
export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Federal Capital Territory',
  'Gilgit-Baltistan',
  'Azad Kashmir'
] as const

// Shipping zones configuration for Pakistan
export const PAKISTAN_SHIPPING_ZONES = {
  metro: {
    name: 'Metro Cities',
    description: 'Major metropolitan areas with fastest delivery',
    base_rate: 150, // PKR
    free_shipping_threshold: 2500, // PKR
    estimated_days: 1
  },
  urban: {
    name: 'Urban Areas',
    description: 'City centers and urban districts',
    base_rate: 200, // PKR
    free_shipping_threshold: 3000, // PKR
    estimated_days: 2
  },
  rural: {
    name: 'Rural Areas',
    description: 'Remote and rural locations',
    base_rate: 300, // PKR
    free_shipping_threshold: 4000, // PKR
    estimated_days: 4
  }
} as const

// Helper functions
export const getPakistanCityById = (cityId: string): PakistanCity | undefined => {
  return PAKISTAN_CITIES.find(city => city.id === cityId)
}

export const getPakistanCitiesByProvince = (province: string): PakistanCity[] => {
  return PAKISTAN_CITIES.filter(city => city.province === province)
}

export const getPakistanCityByPostalCode = (postalCode: string): PakistanCity | undefined => {
  const prefix = postalCode.substring(0, 2)
  return PAKISTAN_CITIES.find(city => city.postal_code_prefix === prefix)
}

export const getMajorPakistanCities = (): PakistanCity[] => {
  return PAKISTAN_CITIES.filter(city => city.is_major_city)
}

export const getPakistanShippingRate = (cityId: string, orderValue: number): {
  zone: string
  rate: number
  isFree: boolean
  estimatedDays: number
} => {
  const city = getPakistanCityById(cityId)
  if (!city) {
    return {
      zone: 'unknown',
      rate: 500,
      isFree: false,
      estimatedDays: 7
    }
  }

  const zoneConfig = PAKISTAN_SHIPPING_ZONES[city.shipping_zone]
  const isFree = orderValue >= zoneConfig.free_shipping_threshold

  return {
    zone: city.shipping_zone,
    rate: isFree ? 0 : zoneConfig.base_rate,
    isFree,
    estimatedDays: city.estimated_delivery_days
  }
}
