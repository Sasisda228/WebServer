"use client";

import { QuantityInputCart, SectionTitle } from "@/components";
import UploadcareImage from "@uploadcare/nextjs-loader";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaCheck, FaCircleQuestion, FaClock, FaXmark } from "react-icons/fa6";
import { useProductStore } from "../_zustand/store";

const CartPage = () => {
  const { products, removeFromCart, calculateTotals, total } =
    useProductStore();

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    calculateTotals();
    toast.success("Product removed from the cart");
  };
  // Helper function to get the display image URL for a product
  function getProductImageUrl(product: { images: string[] }): string | null {
    if (!product.images || product.images.length === 0) return null;
    const firstImage = product.images[0];

    // Check if it's an Uploadcare album URL
    if (
      firstImage.startsWith("https://ucarecdn.com/") &&
      firstImage.match(/^https:\/\/ucarecdn\.com\/[^/]+\/?$/)
    ) {
      // Extract groupId and return the first image from the album
      const match = firstImage.match(/ucarecdn\.com\/([^/]+)/);
      if (match && match[1]) {
        const groupId = match[1];
        // Show the first image in the album (nth/0/)
        return `https://ucarecdn.com/${groupId}/nth/0/-/preview/751x1000/`;
      }
    }

    // Otherwise, just return the first image URL
    return firstImage;
  }
  return (
    <div className="bg-white">
      <SectionTitle title="Cart Page" path="Home | Cart" />
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shopping Cart
          </h1>
          <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>

              <ul
                role="list"
                className="divide-y divide-gray-200 border-b border-t border-gray-200"
              >
                {products.map((product) => (
                  <li key={product.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      {getProductImageUrl(product) ? (
                        <UploadcareImage
                          alt={`Product image`}
                          src={getProductImageUrl(product)!}
                          width={200}
                          height={200}
                          sizes="(max-width: 600px) 100vw, 180px"
                        />
                      ) : (
                        <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <Link
                                href={`#`}
                                className="font-medium text-gray-700 hover:text-gray-800"
                              >
                                {product.title}
                              </Link>
                            </h3>
                          </div>
                          {/* <div className="mt-1 flex text-sm">
                        <p className="text-gray-500">{product.color}</p>
                        {product.size ? (
                          <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{product.size}</p>
                        ) : null}
                      </div> */}
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            ${product.price}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <QuantityInputCart product={product} />
                          <div className="absolute right-0 top-0">
                            <button
                              onClick={() => handleRemoveItem(product.id)}
                              type="button"
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Remove</span>
                              <FaXmark className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                        {1 ? (
                          <FaCheck
                            className="h-5 w-5 flex-shrink-0 text-green-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <FaClock
                            className="h-5 w-5 flex-shrink-0 text-gray-300"
                            aria-hidden="true"
                          />
                        )}

                        <span>{1 ? "In stock" : `Ships in 3 days`}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Order summary */}
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2
                id="summary-heading"
                className="text-lg font-medium text-gray-900"
              >
                Order summary
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${total}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-sm text-gray-600">
                    <span>Shipping estimate</span>
                    <a
                      href="#"
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">
                        Learn more about how shipping is calculated
                      </span>
                      <FaCircleQuestion
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">$5.00</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex text-sm text-gray-600">
                    <span>Tax estimate</span>
                    <a
                      href="#"
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">
                        Learn more about how tax is calculated
                      </span>
                      <FaCircleQuestion
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${total / 5}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Order total
                  </dt>
                  <dd className="text-base font-medium text-gray-900">
                    ${total === 0 ? 0 : Math.round(total + total / 5 + 5)}
                  </dd>
                </div>
              </dl>
              {products.length > 0 && (
                <div className="mt-6">
                  <Link
                    href="/checkout"
                    className="block flex justify-center items-center w-full uppercase bg-white px-4 py-3 text-base border border-black border-gray-300 font-bold text-blue-600 shadow-sm hover:bg-black hover:bg-gray-100 focus:outline-none focus:ring-2"
                  >
                    <span>Checkout</span>
                  </Link>
                </div>
              )}
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
