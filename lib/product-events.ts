// Simple event emitter for product updates
class ProductEventEmitter {
  private static instance: ProductEventEmitter
  private listeners: ((data: any) => void)[] = []

  static getInstance() {
    if (!ProductEventEmitter.instance) {
      ProductEventEmitter.instance = new ProductEventEmitter()
    }
    return ProductEventEmitter.instance
  }

  emit(event: string, data: any) {
    this.listeners.forEach(listener => listener({ event, data }))
  }

  subscribe(listener: (data: any) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
}

export { ProductEventEmitter }
