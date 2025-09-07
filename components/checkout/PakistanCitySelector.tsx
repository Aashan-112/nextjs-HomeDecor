'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { PakistanShippingCalculator } from '../../lib/pakistan-shipping-fixed'
import { PakistanCity } from '../../lib/data/pakistan-locations'

interface PakistanCitySelectorProps {
  selectedCityId?: string
  onCitySelect: (city: PakistanCity) => void
  placeholder?: string
  className?: string
}

export function PakistanCitySelector({
  selectedCityId,
  onCitySelect,
  placeholder = "Search for your city...",
  className = ""
}: PakistanCitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<PakistanCity | null>(null)

  // Load selected city on mount
  useEffect(() => {
    if (selectedCityId) {
      const cities = PakistanShippingCalculator.getPakistanCities()
      const city = cities.find(c => c.id === selectedCityId)
      if (city) {
        setSelectedCity(city)
        setSearchQuery(city.name)
      }
    }
  }, [selectedCityId])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show major cities when no search query
      return PakistanShippingCalculator.getPakistanCities()
        .filter(city => city.is_major_city)
        .slice(0, 8)
    }
    
    return PakistanShippingCalculator.searchPakistanCities(searchQuery)
  }, [searchQuery])

  const handleCitySelect = (city: PakistanCity) => {
    setSelectedCity(city)
    setSearchQuery(city.name)
    setIsOpen(false)
    onCitySelect(city)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
    
    // Clear selection if user is typing
    if (selectedCity && e.target.value !== selectedCity.name) {
      setSelectedCity(null)
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Delay closing to allow clicking on options
    setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoComplete="off"
      />

      {/* Selected City Info */}
      {selectedCity && !isOpen && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">{selectedCity.name}</span>
          <span className="text-gray-400 ml-2">
            {selectedCity.province} • {selectedCity.shipping_zone}
          </span>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {searchResults.length > 0 ? (
            <>
              {!searchQuery.trim() && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  Major Cities
                </div>
              )}
              
              {searchResults.map((city) => (
                <div
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {city.name}
                        {city.is_major_city && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Major
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {city.province}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-600 capitalize">
                        {city.shipping_zone}
                      </div>
                      <div className="text-gray-400">
                        {city.estimated_delivery_days}d delivery
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="text-sm">No cities found</div>
              <div className="text-xs mt-1">
                Try searching by city or province name
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Delivery Options Display Component
interface DeliveryOptionsProps {
  cityId: string
  orderValue?: number
  className?: string
}

export function DeliveryOptions({ 
  cityId, 
  orderValue = 0, 
  className = "" 
}: DeliveryOptionsProps) {
  const { city, options } = PakistanShippingCalculator.getDeliveryOptionsForCity(cityId)
  const shippingZones = PakistanShippingCalculator.getPakistanShippingZones()

  if (!city) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-sm text-gray-500">
          City not found
        </div>
      </div>
    )
  }

  const zoneConfig = shippingZones[city.shipping_zone]

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          Delivery to {city.name}
        </h3>
        <span className="text-sm text-gray-500 capitalize">
          {city.shipping_zone} zone
        </span>
      </div>

      {/* Free Shipping Status */}
      {orderValue > 0 && (
        <div className="p-3 bg-green-50 rounded-lg">
          {orderValue >= zoneConfig.free_shipping_threshold ? (
            <div className="text-sm text-green-800">
              ✓ Qualifies for free shipping
            </div>
          ) : (
            <div className="text-sm text-green-700">
              Add {PakistanShippingCalculator.formatPakistanCurrency(
                zoneConfig.free_shipping_threshold - orderValue
              )} more for free shipping
            </div>
          )}
        </div>
      )}

      {/* Delivery Options */}
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.name}
            className={`flex items-center justify-between p-3 border rounded-lg ${
              option.available 
                ? 'border-gray-200 bg-white' 
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className={option.available ? 'text-gray-900' : 'text-gray-400'}>
              <div className="font-medium">{option.name}</div>
              <div className="text-sm">{option.description}</div>
            </div>
            <div className={`text-right ${option.available ? 'text-gray-700' : 'text-gray-400'}`}>
              {option.estimatedDays === 0 ? (
                <span className="text-sm font-medium">Same day</span>
              ) : (
                <span className="text-sm">
                  {option.estimatedDays} day{option.estimatedDays !== 1 ? 's' : ''}
                </span>
              )}
              {!option.available && (
                <div className="text-xs text-gray-400">Not available</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>• Cash on Delivery available for metro and urban areas</div>
        <div>• Same day delivery only for major metro cities</div>
        <div>• Delivery times may vary during peak seasons</div>
      </div>
    </div>
  )
}
