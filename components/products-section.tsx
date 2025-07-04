"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  quantity: number
}

interface ProductsSectionProps {
  products: Product[]
  onProductsUpdate: (products: Product[]) => void
}

export function ProductsSection({ products, onProductsUpdate }: ProductsSectionProps) {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "1",
  })

  const addProduct = () => {
    if (newProduct.name && newProduct.price) {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        price: Number.parseFloat(newProduct.price),
        quantity: Number.parseInt(newProduct.quantity) || 1,
      }
      onProductsUpdate([...products, product])
      setNewProduct({ name: "", price: "", quantity: "1" })
    }
  }

  const removeProduct = (id: string) => {
    onProductsUpdate(products.filter((p) => p.id !== id))
  }

  const updateProduct = (id: string, field: keyof Product, value: string | number) => {
    onProductsUpdate(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const totalAmount = products.reduce((sum, product) => sum + product.price * product.quantity, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Products & Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Product */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Add Product/Service</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={newProduct.name}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Gas Cylinder, Regulator"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="productPrice">Price (₹)</Label>
                <Input
                  id="productPrice"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="productQuantity">Quantity</Label>
                <Input
                  id="productQuantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, quantity: e.target.value }))}
                  placeholder="1"
                />
              </div>
            </div>
            <Button onClick={addProduct} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Products List */}
        {products.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Added Products</h4>
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-3 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <Input
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                      className="font-medium mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={product.price}
                        onChange={(e) => updateProduct(product.id, "price", Number.parseFloat(e.target.value) || 0)}
                        placeholder="Price"
                      />
                      <Input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProduct(product.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeProduct(product.id)} className="ml-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-right text-sm text-gray-600">
                  Subtotal: ₹{(product.price * product.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
