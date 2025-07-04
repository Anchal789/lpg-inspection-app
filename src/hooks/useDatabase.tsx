"use client"

// Custom React Hook for Database Operations
// This shows how to use the API service in your React Native components

import { useState, useEffect } from "react"
import ApiService from "../api/api-service"

// Hook for fetching inspections
export const useInspections = (deliveryManId: string) => {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInspections()
  }, [deliveryManId])

  const fetchInspections = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getMyInspections(deliveryManId)
      if (response.success) {
        setInspections(response.data)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createInspection = async (inspectionData: any) => {
    try {
      const response = await ApiService.createInspection(inspectionData)
      if (response.success) {
        // Refresh the list
        await fetchInspections()
        return response
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      throw err
    }
  }

  return {
    inspections,
    loading,
    error,
    createInspection,
    refreshInspections: fetchInspections,
  }
}

// Hook for dashboard stats
export const useDashboardStats = (distributorId: string) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [distributorId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getDashboardStats(distributorId)
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, error, refreshStats: fetchStats }
}

// Hook for products
export const useProducts = (distributorId: string) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [distributorId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getProducts(distributorId)
      if (response.success) {
        setProducts(response.data)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (productData: any) => {
    try {
      const response = await ApiService.createProduct(productData)
      if (response.success) {
        await fetchProducts() // Refresh list
        return response
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    createProduct,
    refreshProducts: fetchProducts,
  }
}
