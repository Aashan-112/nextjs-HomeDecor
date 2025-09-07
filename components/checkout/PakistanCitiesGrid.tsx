'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Search, Filter, Star, Truck } from 'lucide-react'
import { PAKISTAN_CITIES, PAKISTAN_PROVINCES, PakistanCity } from '@/lib/data/pakistan-locations'
import { PakistanShippingCalculator } from '@/lib/pakistan-shipping-fixed'

interface PakistanCitiesGridProps {
  onCitySelect?: (city: PakistanCity) => void
  selectedCityId?: string
  showDeliveryInfo?: boolean
  className?: string
}

export function PakistanCitiesGrid({
  onCitySelect,
  selectedCityId,
  showDeliveryInfo = true,
  className = ""
}: PakistanCitiesGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState<string>('all')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [showMajorOnly, setShowMajorOnly] = useState(false)

  const filteredCities = useMemo(() => {
    let cities = [...PAKISTAN_CITIES]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      cities = cities.filter(city => 
        city.name.toLowerCase().includes(query) ||
        city.province.toLowerCase().includes(query)
      )
    }

    // Filter by province
    if (selectedProvince !== 'all') {
      cities = cities.filter(city => city.province === selectedProvince)
    }

    // Filter by shipping zone
    if (selectedZone !== 'all') {
      cities = cities.filter(city => city.shipping_zone === selectedZone)
    }

    // Filter by major cities only
    if (showMajorOnly) {
      cities = cities.filter(city => city.is_major_city)
    }

    // Sort: Major cities first, then alphabetically
    return cities.sort((a, b) => {
      if (a.is_major_city && !b.is_major_city) return -1
      if (!a.is_major_city && b.is_major_city) return 1
      return a.name.localeCompare(b.name)
    })
  }, [searchQuery, selectedProvince, selectedZone, showMajorOnly])

  const getZoneBadgeColor = (zone: string) => {
    switch (zone) {
      case 'metro': return 'bg-green-100 text-green-800 border-green-200'
      case 'urban': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rural': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getShippingInfo = (city: PakistanCity) => {
    const zones = PakistanShippingCalculator.getPakistanShippingZones()
    const zoneInfo = zones[city.shipping_zone]
    return {
      baseRate: zoneInfo.base_rate,
      freeThreshold: zoneInfo.free_shipping_threshold,
      estimatedDays: city.estimated_delivery_days
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6 text-green-600" />
          Pakistani Cities
        </h2>
        <p className="text-muted-foreground">
          Select your city for accurate shipping rates and delivery times
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Cities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities or provinces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {PAKISTAN_PROVINCES.map(province => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger>
                <SelectValue placeholder="All Zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="metro">Metro Cities</SelectItem>
                <SelectItem value="urban">Urban Areas</SelectItem>
                <SelectItem value="rural">Rural Areas</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showMajorOnly ? "default" : "outline"}
              onClick={() => setShowMajorOnly(!showMajorOnly)}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Major Cities Only
            </Button>

            <div className="text-sm text-muted-foreground flex items-center">
              {filteredCities.length} cities found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCities.map((city) => {
          const shippingInfo = getShippingInfo(city)
          const isSelected = selectedCityId === city.id

          return (
            <Card 
              key={city.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onCitySelect?.(city)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* City Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {city.name}
                        {city.is_major_city && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {city.province}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getZoneBadgeColor(city.shipping_zone)}
                    >
                      {city.shipping_zone}
                    </Badge>
                  </div>

                  {/* Postal Code */}
                  <div className="text-xs text-muted-foreground">
                    Postal Code: {city.postal_code_prefix}xxx
                  </div>

                  {/* Shipping Info */}
                  {showDeliveryInfo && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {shippingInfo.estimatedDays} day{shippingInfo.estimatedDays !== 1 ? 's' : ''} delivery
                        </span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          Base rate: {PakistanShippingCalculator.formatPakistanCurrency(shippingInfo.baseRate)}
                        </div>
                        <div className="text-green-600">
                          Free shipping ≥ {PakistanShippingCalculator.formatPakistanCurrency(shippingInfo.freeThreshold)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      Selected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Results */}
      {filteredCities.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No cities found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('')
              setSelectedProvince('all')
              setSelectedZone('all')
              setShowMajorOnly(false)
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {PAKISTAN_CITIES.filter(c => c.shipping_zone === 'metro').length}
              </div>
              <div className="text-sm text-muted-foreground">Metro Cities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {PAKISTAN_CITIES.filter(c => c.shipping_zone === 'urban').length}
              </div>
              <div className="text-sm text-muted-foreground">Urban Areas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {PAKISTAN_CITIES.filter(c => c.shipping_zone === 'rural').length}
              </div>
              <div className="text-sm text-muted-foreground">Rural Areas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {PAKISTAN_CITIES.filter(c => c.is_major_city).length}
              </div>
              <div className="text-sm text-muted-foreground">Major Cities</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
