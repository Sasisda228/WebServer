"use client";
// *********************
// Role of the component: Product table component on admin dashboard page
// Name of the component: DashboardProductTable.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.1
// Component call: <DashboardProductTable />
// Input parameters: no input parameters
// Output: products table
// *********************

import axios from "axios"
import { nanoid } from "nanoid"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import CustomButton from "./CustomButton"

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios
      .get("/apiv3/products?mode=admin", {
        headers: { "Cache-Control": "no-store" },
      })
      .then((res) => {
        setProducts(res.data);
      })
      .catch(() => {
        // Optionally handle error here
        setProducts([]);
      });
  };

  const handlePositionChange = async (productId: string, newPosition: number) => {
    // Mark this product as updating
    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    
    try {
      // Send request to update position
      await axios.post(`/apiv3/products/updatePosition/${productId}`, {
        position: newPosition
      });
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, position: newPosition } 
            : product
        )
      );
    } catch (error) {
      console.error("Failed to update product position:", error);
      // You could add error notification here
    } finally {
      // Mark product as no longer updating
      setIsUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Debounced version of position change handler
  const debouncedPositionChange = (productId: string, newPosition: number) => {
    const timeoutId = setTimeout(() => {
      handlePositionChange(productId, newPosition);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-5">All products</h1>
      <div className="flex justify-end mb-5">
        <Link href="/admin/products/new">
          <CustomButton
            buttonType="button"
            customWidth="110px"
            paddingX={10}
            paddingY={5}
            textSize="base"
            text="Add new product"
          />
        </Link>
      </div>

      <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto w-full h-[80vh]">
        <table className="table table-md table-pin-cols">
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Product</th>
              <th>Stock Availability</th>
              <th>Price</th>
              <th>Position</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {products &&
              products.map((product) => (
                <tr key={nanoid()}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <Image
                            width={48}
                            height={48}
                            src={
                              product?.images[0]
                                ? `${product?.images[0]}/nth/0/
-/preview/751x1000/`
                                : "/product_placeholder.jpg"
                            }
                            alt="Avatar Tailwind CSS Component"
                            className="w-auto h-auto"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{product?.title}</div>
                        <div className="text-sm opacity-50">
                          {product?.manufacturer}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    {product?.inStock ? (
                      <span className="badge badge-success text-white badge-sm">
                        In stock
                      </span>
                    ) : (
                      <span className="badge badge-error text-white badge-sm">
                        Out of stock
                      </span>
                    )}
                  </td>
                  <td>${product?.price}</td>
                  <td>
                    <div className="flex items-center">
                      <input
                        type="number"
                        className="input input-bordered input-sm w-20"
                        value={product.position || 0}
                        onChange={(e) => {
                          const newPosition = parseInt(e.target.value, 10);
                          // Update local state immediately for responsive UI
                          setProducts(prevProducts => 
                            prevProducts.map(p => 
                              p.id === product.id 
                                ? { ...p, position: newPosition } 
                                : p
                            )
                          );
                          // Debounce the API call
                          debouncedPositionChange(product.id, newPosition);
                        }}
                      />
                      {isUpdating[product.id] && (
                        <span className="loading loading-spinner loading-xs ml-2"></span>
                      )}
                    </div>
                  </td>
                  <th>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="btn btn-ghost btn-xs"
                    >
                      details
                    </Link>
                  </th>
                </tr>
              ))}
          </tbody>
          {/* foot */}
          <tfoot>
            <tr>
              <th></th>
              <th>Product</th>
              <th>Stock Availability</th>
              <th>Price</th>
              <th>Position</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DashboardProductTable;
