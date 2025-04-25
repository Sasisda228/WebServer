"use client";
import { DashboardSidebar } from "@/components";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import UploadcareImage from "@uploadcare/nextjs-loader";
import "@uploadcare/react-uploader/core.css";
import { FileInfo, Widget } from "@uploadcare/react-widget"; // Import FileInfo type from the package
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Типы данных для работы с Prisma
interface Category {
  id: string;
  name: string;
}

// Интерфейс для информации о группе файлов Uploadcare

const AddNewProduct = () => {
  const [product, setProduct] = useState<{
    title: string;
    price: number;
    manufacturer: string;
    inStock: number;
    description: string;
    slug: string;
    categoryId: string;
    images: string[];
  }>({
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    description: "",
    slug: "",
    categoryId: "",
    images: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [albumGroupId, setAlbumGroupId] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [, setImageCount] = useState(0);
  const addProduct = async () => {
    // Валидация полей
    if (
      product.title === "" ||
      product.manufacturer === "" ||
      product.description === "" ||
      product.slug === ""
    ) {
      toast.error("Please enter values in input fields");
      return;
    }

    setIsLoading(true);

    // Если есть альбом, используем его URL как основной источник изображений

    try {
      toast.success("Product added successfully");

      // Очищаем форму для нового товара
      setProduct({
        title: "",
        price: 0,
        manufacturer: "",
        inStock: 1,
        description: "",
        slug: "",
        categoryId: categories[0]?.id || "",
        images: [],
      });

      // Очищаем изображения и альбом
      setProductImages([]);
      setAlbumGroupId(null);
      setAlbumImages([]);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("There was an error while creating product");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/apiv3/categories");
      setCategories(data);
      setProduct({
        title: "",
        price: 0,
        manufacturer: "",
        inStock: 1,
        description: "",
        slug: "",
        categoryId: data[0]?.id,
        images: [],
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Обработчик загрузки группы изображений через Uploadcare
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

  // Загрузка информации о файлах в группе (альбоме)
  const fetchAlbumImages = async (groupId: string) => {
    try {
      // Используем Uploadcare REST API для получения информации о группе
      const response = await axios.get(
        `https://api.uploadcare.com/groups/${groupId}/`,
        {
          headers: {
            Accept: "application/vnd.uploadcare-v0.5+json",
            Authorization: `Uploadcare.Simple ${
              process.env.NEXT_PUBLIC_UPLOADCARE_KEY || "75ae123269ffcd1362e6"
            }:`,
          },
        }
      );

      const data = response.data;
      print();
      // Извлекаем URL всех файлов в группе
      if (data.files && Array.isArray(data.files)) {
        const imageUrls = data.files.map(
          (file: any) => file.original_file_url || file.cdn_url
        );
        setImageCount(data.files_count);
        setAlbumImages(imageUrls);
      }
    } catch (error) {
      console.error("Error fetching album images:", error);
      toast.error("Failed to load album images");
    }
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

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Add new product</h1>

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

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product slug:</span>
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

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.categoryId}
              onChange={(e) =>
                setProduct({ ...product, categoryId: e.target.value })
              }
            >
              {categories &&
                categories.map((category: any) => (
                  <option key={category?.id} value={category?.id}>
                    {category?.name}
                  </option>
                ))}
            </select>
          </label>
        </div>

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

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered"
              value={product.inStock}
              onChange={(e) =>
                setProduct({ ...product, inStock: Number(e.target.value) })
              }
              disabled={isLoading}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>

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
                    <p className="font-medium">
                      Album created successfully! {albumImages.length}
                    </p>
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
                  <h3 className="font-medium mb-2">Album Preview:</h3>
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

        <div className="flex gap-x-2">
          <button
            onClick={addProduct}
            type="button"
            className={`uppercase px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm focus:outline-none focus:ring-2 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 hover:text-white"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
