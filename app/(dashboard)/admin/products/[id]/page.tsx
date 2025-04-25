"use client";
import { DashboardSidebar } from "@/components";
import UploadcareImage from "@uploadcare/nextjs-loader";
import { FileInfo } from "@uploadcare/react-widget"; // Import FileInfo type from the package
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
const Widget = dynamic(
  () => import("@uploadcare/react-widget").then((mod) => mod.Widget),
  {
    ssr: false,
    loading: () => <p>Loading image uploader...</p>,
  }
);

interface DashboardProductDetailsProps {
  params: { id: string };
}

// Remove our custom FileInfo interface since we're importing the official one

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  manufacturer: string;
  description: string;
  slug: string;
  inStock: number;
  categoryId: string;
  images: string[];
  mainImage?: string;
  category?: Category;
}

const DashboardProductDetails = ({
  params: { id },
}: DashboardProductDetailsProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [albumGroupId, setAlbumGroupId] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const router = useRouter();

  // Функция для удаления товара
  const deleteProduct = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsLoading(true);

    try {
      toast.success("Product deleted successfully");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      if (error.response && error.response.status === 400) {
        toast.error(
          "Cannot delete the product because of foreign key constraint"
        );
      } else {
        toast.error("There was an error while deleting product");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для обновления товара
  const updateProduct = async () => {
    if (!product) return;

    if (
      product.title === "" ||
      product.slug === "" ||
      product.manufacturer === "" ||
      product.description === ""
    ) {
      toast.error("You need to enter values in input fields");
      return;
    }

    setIsLoading(true);

    // Если есть новый альбом, используем его URL
    const imagesToSave = albumGroupId
      ? [`https://ucarecdn.com/${albumGroupId}/`]
      : product.images;

    try {
      await axios.put(`/apiv3/products/${id}`, {
        ...product,
        images: imagesToSave,
      });

      toast.success("Product successfully updated");

      // Обновляем данные товара
      fetchProductData();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("There was an error while updating product");
    } finally {
      setIsLoading(false);
    }
  };

  // Получение данных о товаре
  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/apiv3/products/${id}`);
      setProduct(data);

      // Проверяем, есть ли у товара изображения в формате URL альбома
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        const firstImage = data.images[0];

        // Проверяем, является ли URL ссылкой на альбом Uploadcare
        if (firstImage.includes("ucarecdn.com") && firstImage.includes("/")) {
          // Извлекаем ID альбома из URL
          const match = firstImage.match(/ucarecdn\.com\/([^\/]+)/);
          if (match && match[1]) {
            setAlbumGroupId(match[1]);
            fetchAlbumImages(match[1]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Error loading product data");
    } finally {
      setIsLoading(false);
    }
  };

  // Получение списка категорий
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`/apiv3/categories`);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error loading categories");
    }
  };

  // Загрузка информации о файлах в группе (альбоме)
  const fetchAlbumImages = async (groupId: string) => {
    try {
      // Используем Uploadcare REST API для получения информации о группе
      const { data } = await axios.get(
        `https://api.uploadcare.com/groups/${groupId}/`,
        {
          headers: {
            Accept: "application/vnd.uploadcare-v0.7+json",
            Authorization: `Uploadcare.Simple 75ae123269ffcd1362e6:dabbafb5c211c86840bc`,
          },
        }
      );

      // Извлекаем URL всех файлов в группе
      if (data.files && Array.isArray(data.files)) {
        const imageUrls = data.files.map(
          (file: any) => file.original_file_url || file.cdn_url
        );
        setAlbumImages(imageUrls);
      }
    } catch (error) {
      console.error("Error fetching album images:", error);
    }
  };

  // Updated handler to use the official FileInfo type
  const handleGroupUpload = (fileInfo: FileInfo) => {
    setUploadingImages(false);

    // Check if this is a group upload (has uuid)
    if (!fileInfo || !fileInfo.uuid) {
      console.error("Failed to get file information");
      return;
    }

    // For group uploads, the uuid will contain the group ID
    const groupId = fileInfo.uuid;

    // Save the group ID (album)
    setAlbumGroupId(groupId);

    // Load information about files in the group
    fetchAlbumImages(groupId);
  };

  // Обработчик удаления альбома
  const handleRemoveAlbum = () => {
    setAlbumGroupId(null);
    setAlbumImages([]);
  };

  // Обработчик начала загрузки
  const handleUploadStart = () => {
    setUploadingImages(true);
  };

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, [id]);

  if (!product) {
    return (
      <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
        <DashboardSidebar />
        <div className="flex flex-col gap-y-7 xl:ml-5 w-full max-xl:px-5">
          <h1 className="text-3xl font-semibold">Product details</h1>
          <p>Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-5 w-full max-xl:px-5">
        <h1 className="text-3xl font-semibold">Product details</h1>

        {/* Product name input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.title}
              onChange={(e) =>
                setProduct({ ...product, title: e.target.value })
              }
              disabled={isLoading}
            />
          </label>
        </div>
        {/* Product name input div - end */}

        {/* Product price input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price:</span>
            </div>
            <input
              type="number"
              className="input input-bordered w-full max-w-xs"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: Number(e.target.value) })
              }
              min="0"
              step="1"
              disabled={isLoading}
            />
          </label>
        </div>
        {/* Product price input div - end */}

        {/* Product manufacturer input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Manufacturer:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.manufacturer}
              onChange={(e) =>
                setProduct({ ...product, manufacturer: e.target.value })
              }
              disabled={isLoading}
            />
          </label>
        </div>
        {/* Product manufacturer input div - end */}

        {/* Product slug input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={convertSlugToURLFriendly(product.slug)}
              onChange={(e) =>
                setProduct({
                  ...product,
                  slug: convertSlugToURLFriendly(e.target.value),
                })
              }
              disabled={isLoading}
            />
          </label>
        </div>
        {/* Product slug input div - end */}

        {/* Product inStock select input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered"
              value={product.inStock}
              onChange={(e) => {
                setProduct({ ...product, inStock: Number(e.target.value) });
              }}
              disabled={isLoading}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>
        {/* Product inStock select input div - end */}

        {/* Product category select input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product.categoryId}
              onChange={(e) =>
                setProduct({
                  ...product,
                  categoryId: e.target.value,
                })
              }
              disabled={isLoading || categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">Loading categories...</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {formatCategoryName(category.name)}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
        {/* Product category select input div - end */}

        {/* Загрузка изображений в альбом */}
        <div>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Product images:</span>
            </div>
            <div className="space-y-4">
              <div className="mb-4">
                {!albumGroupId ? (
                  <>
                    <p className="mb-2">
                      Upload multiple images to create an album:
                    </p>
                    <Widget
                      publicKey={
                        process.env.NEXT_PUBLIC_UPLOADCARE_KEY ||
                        "75ae123269ffcd1362e6"
                      }
                      onChange={handleGroupUpload}
                      onDialogOpen={handleUploadStart}
                      multiple
                      multipleMax={10}
                      imagesOnly
                      previewStep
                      tabs="file camera url"
                      clearable
                      systemDialog
                      validators={[
                        (fileInfo: any) => {
                          if (fileInfo.isImage === false) {
                            throw new Error("Only images are allowed");
                          }
                        },
                      ]}
                    />
                    {uploadingImages && (
                      <p className="text-blue-500 mt-2">Uploading...</p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">Album created successfully!</p>
                    <p>
                      Album URL:{" "}
                      <a
                        href={`https://ucarecdn.com/${albumGroupId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >{`https://ucarecdn.com/${albumGroupId}/`}</a>
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveAlbum}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-fit"
                    >
                      Remove Album & Upload New Images
                    </button>
                  </div>
                )}
              </div>

              {/* Отображение изображений из альбома */}
              {albumGroupId && (
                <div>
                  <h3 className="font-medium mb-2">
                    Album Preview({albumImages.length}):
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Если у нас есть отдельные URL изображений из альбома */}
                    {albumImages.length > 0
                      ? albumImages.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <UploadcareImage
                              alt={`Product image ${index + 1}`}
                              src={imageUrl}
                              width="200"
                              height="200"
                              style={{ objectFit: "cover" }}
                            />
                            <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white px-2 py-1 text-xs">
                              {index + 1}
                            </div>
                          </div>
                        ))
                      : // Если у нас нет отдельных URL, показываем первые 4 изображения из альбома
                        Array.from({ length: Math.min(4, 10) }).map(
                          (_, index) => (
                            <div key={index} className="relative">
                              <UploadcareImage
                                alt={`Product image ${index + 1}`}
                                src={`https://ucarecdn.com/${albumGroupId}/nth/${index}/`}
                                width="200"
                                height="200"
                                style={{ objectFit: "cover" }}
                              />
                              <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white px-2 py-1 text-xs">
                                {index + 1}
                              </div>
                            </div>
                          )
                        )}
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Product description div - start */}
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product.description}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
              disabled={isLoading}
            ></textarea>
          </label>
        </div>
        {/* Product description div - end */}

        {/* Action buttons div - start */}
        <div className="flex gap-x-2 max-sm:flex-col">
          <button
            type="button"
            onClick={updateProduct}
            className={`uppercase px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm focus:outline-none focus:ring-2 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 hover:text-white"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Update product"}
          </button>
          <button
            type="button"
            className={`uppercase px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm focus:outline-none focus:ring-2 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 hover:text-white"
            }`}
            onClick={deleteProduct}
            disabled={isLoading}
          >
            Delete product
          </button>
        </div>
        {/* Action buttons div - end */}

        <p className="text-xl max-sm:text-lg text-error">
          To delete the product you first need to delete all its records in
          orders (customer_order_product table).
        </p>
      </div>
    </div>
  );
};

export default DashboardProductDetails;
