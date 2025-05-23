"use client";
import { DashboardSidebar } from "@/components";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { compressMultipleImages } from "@/utils/imageCompression";
import UploadcareImage from "@uploadcare/nextjs-loader";
import "@uploadcare/react-uploader/core.css";
import { FileInfo } from "@uploadcare/react-widget";
import axios from "axios";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// Dynamically import ReactQuill with ssr: false to prevent document is not defined error
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

// Dynamically import the CSS for ReactQuill only on client side

// Dynamically import Widget from Uploadcare
const Widget = dynamic(
  () => import("@uploadcare/react-widget").then((mod) => mod.Widget),
  {
    ssr: false,
    loading: () => <p>Loading image uploader...</p>,
  }
);

// Типы данных для работы с Prisma
interface Category {
  id: string;
  name: string;
}

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "color",
  "background",
];

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
  const [albumGroupId, setAlbumGroupId] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [, setCompressedFiles] = useState<File[]>([]);
  const widgetRef = useRef<any>(null);

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
    const imagesToSave = albumGroupId
      ? [`https://ucarecdn.com/${albumGroupId}/`]
      : [];

    try {
      // Используем axios для отправки данных
      await axios.post(`/apiv3/products`, {
        ...product,
        // Убедимся, что числовые поля передаются как числа
        price: Number(product.price),
        inStock: Number(product.inStock),
        // Передаем URL альбома или пустой массив
        images: imagesToSave,
      });

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
      const response = await fetch(
        `https://api.uploadcare.com/groups/${groupId}/`,
        {
          headers: {
            Accept: "application/vnd.uploadcare-v0.5+json",
            Authorization: `Uploadcare.Simple ${
              process.env.NEXT_PUBLIC_UPLOADCARE_KEY || "75ae123269ffcd1362e6"
            }:${
              process.env.NEXT_PUBLIC_UPLOADCARE_SECRET ||
              "dabbafb5c211c86840bc"
            }`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Извлекаем URL всех файлов в группе
      if (data.files && Array.isArray(data.files)) {
        const imageUrls = data.files.map(
          (file: any) => file.original_file_url || file.cdn_url
        );
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

  // Handler for file input change to compress images before upload
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      toast.loading("Compressing images...", { id: "compressing" });

      // Compress the selected images
      const compressed = await compressMultipleImages(Array.from(files), {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: 0.8,
      });

      setCompressedFiles(compressed);
      toast.success("Images compressed successfully!", { id: "compressing" });

      // Open Uploadcare Widget with compressed files
      if (widgetRef.current) {
        widgetRef.current.openDialog(compressed);
      }
    } catch (err) {
      console.error("Error compressing images:", err);
      toast.error("Error compressing images", { id: "compressing" });
      setUploadingImages(false);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      {/* Import Quill styles only on client side */}
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
                    <div className="flex flex-col gap-3">
                      <div className="border border-dashed border-gray-300 rounded-md p-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Select images to compress before uploading:
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileInputChange}
                          disabled={uploadingImages}
                          className="file-input file-input-bordered w-full max-w-xs"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Images will be compressed to reduce size before
                          uploading
                        </p>
                      </div>

                      <p className="text-sm font-medium">
                        OR use direct Uploadcare uploader:
                      </p>

                      <Widget
                        ref={widgetRef}
                        publicKey={
                          process.env.NEXT_PUBLIC_UPLOADCARE_KEY ||
                          "75ae123269ffcd1362e6"
                        }
                        onChange={handleGroupUpload}
                        onDialogOpen={handleUploadStart}
                        onDialogClose={() => setUploadingImages(false)} // <--- добавьте это!
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
                    </div>
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
            {/* Only render ReactQuill on client side */}
            {typeof window !== "undefined" && (
              <ReactQuill
                theme="snow"
                value={product.description}
                onChange={(content) => {
                  // content — это уже строка с HTML!
                  setProduct({
                    ...product,
                    description: content,
                  });
                }}
                formats={formats}
              />
            )}
          </label>
        </div>

        <div className="flex gap-x-2">
          <button
            onClick={addProduct}
            type="button"
            className={`fixed bottom-16 right-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 z-50 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isLoading}
            aria-label="Add Product"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
