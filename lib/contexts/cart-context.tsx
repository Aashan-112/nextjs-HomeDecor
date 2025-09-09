'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { CartItem, Product, CartSummary } from '../types'
import { ShippingAddress, ShippingCalculator } from '../shipping'
import { CartUtils } from '../cart-utils'

// Cart Context State
interface CartState {
  items: CartItem[]
  summary: CartSummary | null
  shippingAddress: ShippingAddress | null
  selectedShippingMethodId: string | null
  isLoading: boolean
  error: string | null
  lastCalculated: Date | null
}

// Cart Actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: ShippingAddress | null }
  | { type: 'SET_SHIPPING_METHOD'; payload: string | null }
  | { type: 'SET_SUMMARY'; payload: CartSummary }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_CART'; payload: CartItem[] }

// Cart Context Value
interface CartContextValue extends CartState {
  addItem: (product: Product, quantity?: number) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  setShippingAddress: (address: ShippingAddress | null) => void
  setShippingMethod: (methodId: string | null) => void
  recalculateCart: (products: Product[], shippingCalculator?: ShippingCalculator) => Promise<void>
  getItemQuantity: (productId: string) => number
  getTotalItems: () => number
  hasItems: boolean
}

// Initial state
const initialState: CartState = {
  items: [],
  summary: null,
  shippingAddress: null,
  selectedShippingMethodId: null,
  isLoading: false,
  error: null,
  lastCalculated: null
}

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload
      const existingItemIndex = state.items.findIndex(item => item.product_id === product.id)
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.items]
        const existingItem = updatedItems[existingItemIndex]
        const newQuantity = existingItem.quantity + quantity
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        }
        
        return { ...state, items: updatedItems }
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random()}`,
          user_id: '', // Will be set when user is authenticated
          product_id: product.id,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product
        }
        
        return { ...state, items: [...state.items, newItem] }
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload
      
      if (quantity <= 0) {
        return { ...state, items: state.items.filter(item => item.id !== itemId) }
      }
      
      const updatedItems = state.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            updated_at: new Date().toISOString()
          }
        }
        return item
      })
      
      return { ...state, items: updatedItems }
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.itemId)
      }
    }
    
    case 'CLEAR_CART': {
      return {
        ...initialState
      }
    }
    
    case 'SET_SHIPPING_ADDRESS': {
      return {
        ...state,
        shippingAddress: action.payload,
        selectedShippingMethodId: null // Reset shipping method when address changes
      }
    }
    
    case 'SET_SHIPPING_METHOD': {
      return {
        ...state,
        selectedShippingMethodId: action.payload
      }
    }
    
    case 'SET_SUMMARY': {
      return {
        ...state,
        summary: action.payload,
        lastCalculated: new Date()
      }
    }
    
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload
      }
    }
    
    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload
      }
    }
    
    case 'LOAD_CART': {
      return {
        ...state,
        items: action.payload
      }
    }
    
    default:
      return state
  }
}

// Create context
const CartContext = createContext<CartContextValue | undefined>(undefined)

// Local storage key
const CART_STORAGE_KEY = 'ecommerce_cart'

// Cart Provider
interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartData })
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [state.items])

  // Context value functions
  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } })
  }

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const setShippingAddress = (address: ShippingAddress | null) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address })
  }

  const setShippingMethod = (methodId: string | null) => {
    dispatch({ type: 'SET_SHIPPING_METHOD', payload: methodId })
  }

  const recalculateCart = async (
    products: Product[],
    shippingCalculator?: ShippingCalculator
  ) => {
    if (state.items.length === 0) {
      dispatch({ type: 'SET_SUMMARY', payload: {
        items: [],
        subtotal: 0,
        tax_amount: 0,
        shipping_amount: 0,
        total_amount: 0,
        available_shipping_methods: [],
        selected_shipping_method: undefined
      }})
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Update cart item prices first
      const updatedItems = CartUtils.updateCartItemPrices(state.items, products)
      
      // Calculate cart summary
      const summary = await CartUtils.calculateCartSummary(
        updatedItems,
        products,
        state.shippingAddress,
        state.selectedShippingMethodId,
        shippingCalculator
      )

      dispatch({ type: 'SET_SUMMARY', payload: summary })
    } catch (error) {
      console.error('Failed to recalculate cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to calculate cart total' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.product_id === productId)
    return item?.quantity ?? 0
  }

  const getTotalItems = (): number => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const hasItems = state.items.length > 0

  const contextValue: CartContextValue = {
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setShippingAddress,
    setShippingMethod,
    recalculateCart,
    getItemQuantity,
    getTotalItems,
    hasItems
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Additional hooks for specific use cases
export function useCartSummary() {
  const { summary, isLoading, error } = useCart()
  return { summary, isLoading, error }
}

export function useCartItems() {
  const { items, getTotalItems, hasItems } = useCart()
  return { items, totalItems: getTotalItems(), hasItems }
}

export function useShipping() {
  const {
    shippingAddress,
    selectedShippingMethodId,
    summary,
    setShippingAddress,
    setShippingMethod
  } = useCart()
  
  return {
    shippingAddress,
    selectedShippingMethodId,
    availableShippingMethods: summary?.available_shipping_methods ?? [],
    shippingAmount: summary?.shipping_amount ?? 0,
    setShippingAddress,
    setShippingMethod
  }
}
