"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Product {
  id: string
  name: string
  price: number
  minPrice: number
  quantity: number
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

interface DataContextType {
  inspections: Inspection[]
  deliveryMen: DeliveryMan[]
  products: Product[]
  addInspection: (inspection: Inspection) => void
  addProduct: (product: Product) => void
  assignProductToDeliveryMan: (deliveryManId: string, product: Product) => void
  getInspectionsByDeliveryMan: (deliveryManId: string) => Inspection[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [inspections, setInspections] = useState<Inspection[]>([
    {
      id: "1",
      consumerName: "Rajesh Kumar",
      consumerNumber: "LPG001234",
      mobileNumber: "+91 9876543210",
      address: "123 MG Road, Bangalore",
      deliveryManId: "1",
      deliveryManName: "Ravi Singh",
      date: "2024-01-15T10:30:00Z",
      answers: { 0: "yes", 1: "yes", 2: "no", 3: "yes" },
      images: ["image1.jpg"],
      products: [
        { id: "1", name: "Gas Cylinder", price: 850, quantity: 1 },
        { id: "2", name: "Regulator", price: 200, quantity: 1 },
      ],
      totalAmount: 1050,
      location: { latitude: 12.9716, longitude: 77.5946 },
    },
  ])

  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([
    {
      id: "1",
      name: "Ravi Singh",
      phone: "+91 9876543210",
      totalInspections: 25,
      totalSales: 45000,
      assignedProducts: [],
    },
    {
      id: "2",
      name: "Amit Sharma",
      phone: "+91 9876543211",
      totalInspections: 18,
      totalSales: 32000,
      assignedProducts: [],
    },
  ])

  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Gas Cylinder", price: 850, minPrice: 800, quantity: 100 },
    { id: "2", name: "Regulator", price: 200, minPrice: 180, quantity: 50 },
    { id: "3", name: "Gas Stove", price: 1500, minPrice: 1400, quantity: 25 },
  ])

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
  }

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product])
  }

  const assignProductToDeliveryMan = (deliveryManId: string, product: Product) => {
    setDeliveryMen((prev) =>
      prev.map((dm) => (dm.id === deliveryManId ? { ...dm, assignedProducts: [...dm.assignedProducts, product] } : dm)),
    )
  }

  const getInspectionsByDeliveryMan = (deliveryManId: string) => {
    return inspections.filter((inspection) => inspection.deliveryManId === deliveryManId)
  }

  return (
    <DataContext.Provider
      value={{
        inspections,
        deliveryMen,
        products,
        addInspection,
        addProduct,
        assignProductToDeliveryMan,
        getInspectionsByDeliveryMan,
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
