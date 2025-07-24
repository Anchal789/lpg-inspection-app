"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Product {
  id: string
  name: string
  price: number
  minPrice: number
  quantity: number
  assignedQuantity?: number
  soldQuantity?: number
}

interface Inspection {
  id: string
  consumerName: string
  consumerNumber: string
  mobileNumber: string
  address: string
  deliveryManId: string
  deliveryManName: string
  date: string
  answers: Record<number, string>
  images: string[]
  products: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  totalAmount: number
  location: {
    latitude: number
    longitude: number
  }
}

interface DeliveryMan {
  id: string
  name: string
  phone: string
  totalInspections: number
  totalSales: number
  assignedProducts: Product[]
}

interface AppSettings {
  hotplateName: string
  hotplatePrice: number
  hotplateExchangeRate: number
  portablePlatformName: string
  portablePlatformPrice: number
}

interface DataContextType {
  inspections: Inspection[]
  deliveryMen: DeliveryMan[]
  products: Product[]
  appSettings: AppSettings
  addInspection: (inspection: Inspection) => void
  addProduct: (product: Product) => void
  assignProductToDeliveryMan: (deliveryManId: string, product: Product, quantity: number) => void
  getInspectionsByDeliveryMan: (deliveryManId: string) => Inspection[]
  updateAppSettings: (settings: Partial<AppSettings>) => void
  updateProductStock: (productId: string, soldQuantity: number) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [appSettings, setAppSettings] = useState<AppSettings>({
    hotplateName: "Hi-star hotplate",
    hotplatePrice: 900,
    hotplateExchangeRate: 450,
    portablePlatformName: "Portable Platform",
    portablePlatformPrice: 0,
  })

  const addInspection = (inspection: Inspection) => {
    setInspections((prev) => [...prev, inspection])

    // Update delivery man stats
    setDeliveryMen((prev) =>
      prev.map((dm) =>
        dm.id === inspection.deliveryManId
          ? {
              ...dm,
              totalInspections: dm.totalInspections + 1,
              totalSales: dm.totalSales + inspection.totalAmount,
            }
          : dm,
      ),
    )

    // Update product stock
    inspection.products.forEach((product) => {
      updateProductStock(product.id, product.quantity)
    })
  }

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product])
  }

  const assignProductToDeliveryMan = (deliveryManId: string, product: Product, quantity: number) => {
    // Check remaining stock
    const remainingStock = product.quantity - (product.assignedQuantity || 0) - (product.soldQuantity || 0)

    if (quantity > remainingStock) {
      throw new Error(`Only ${remainingStock} units available`)
    }

    setDeliveryMen((prev) =>
      prev.map((dm) =>
        dm.id === deliveryManId
          ? {
              ...dm,
              assignedProducts: [...dm.assignedProducts, { ...product, quantity }],
            }
          : dm,
      ),
    )

    // Update product assigned quantity
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, assignedQuantity: (p.assignedQuantity || 0) + quantity } : p)),
    )
  }

  const updateProductStock = (productId: string, soldQuantity: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, soldQuantity: (p.soldQuantity || 0) + soldQuantity } : p)),
    )
  }

  const getInspectionsByDeliveryMan = (deliveryManId: string) => {
    return inspections.filter((inspection) => inspection.deliveryManId === deliveryManId)
  }

  const updateAppSettings = (settings: Partial<AppSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...settings }))
  }

  return (
    <DataContext.Provider
      value={{
        inspections,
        deliveryMen,
        products,
        appSettings,
        addInspection,
        addProduct,
        assignProductToDeliveryMan,
        getInspectionsByDeliveryMan,
        updateAppSettings,
        updateProductStock,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
