"use client";

// *********************
// Role of the component: Button for adding and removing product to the wishlist on the single product page
// Name of the component: AddToWishlistBtn.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.1 (axios refactor)
// Component call: <AddToWishlistBtn product={product} slug={slug}  />
// Input parameters: AddToWishlistBtnProps interface
// Output: Two buttons with adding and removing from the wishlist functionality
// *********************

import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaHeart, FaHeartCrack } from "react-icons/fa6";

interface AddToWishlistBtnProps {
  product: Product;
  slug: string;
}

const AddToWishlistBtn = ({ product }: AddToWishlistBtnProps) => {
  const { data: session } = useSession();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();
  const [isProductInWishlist, setIsProductInWishlist] = useState<boolean>();

  // Получить userId по email
  const getUserIdByEmail = async (email: string): Promise<string | null> => {
    try {
      const res = await axios.get(`/apiv3/users/email/${email}`, {
        headers: { Accept: "application/json, text/plain, */*" },
      });
      return res.data?.id || null;
    } catch (error) {
      return null;
    }
  };

  const addToWishlistFun = async () => {
    if (session?.user?.email) {
      try {
        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) throw new Error("User not found");

        await axios.post(
          "/apiv3/wishlist",
          {
            productId: product?.id,
            userId: userId,
          },
          {
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
          }
        );

        addToWishlist({
          id: product?.id,
          title: product?.title,
          price: product?.price,
          images: product?.images,
          slug: product?.slug,
          stockAvailabillity: product?.inStock,
        });
        toast.success("Товар был добавлен в лист желаемого");
      } catch (error) {
        toast.error("Не удалось добавить товар в лист желаемого");
      }
    } else {
      toast.error("Войдите в аккаунт для добавления товара в лист желаемого");
    }
  };

  const removeFromWishlistFun = async () => {
    if (session?.user?.email) {
      try {
        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) throw new Error("User not found");

        await axios.delete(`/apiv3/wishlist/${userId}/${product?.id}`);

        removeFromWishlist(product?.id);
        toast.success("Товар удален из листа желаемого");
      } catch (error) {
        toast.error("Не удалось удалить товар из листа желаемого");
      }
    }
  };

  const isInWishlist = async () => {
    if (session?.user?.email) {
      try {
        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
          setIsProductInWishlist(false);
          return;
        }
        const res = await axios.get(`/apiv3/wishlist/${userId}/${product?.id}`);
        if (Array.isArray(res.data) && res.data[0]?.id) {
          setIsProductInWishlist(true);
        } else {
          setIsProductInWishlist(false);
        }
      } catch (error) {
        setIsProductInWishlist(false);
      }
    }
  };

  useEffect(() => {
    isInWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, wishlist]);

  return (
    <>
      {isProductInWishlist ? (
        <p
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={removeFromWishlistFun}
        >
          <FaHeartCrack className="text-xl text-custom-black" />
          <span className="text-lg">Удалить из желаемого</span>
        </p>
      ) : (
        <p
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={addToWishlistFun}
        >
          <FaHeart className="text-xl text-custom-black" />
          <span className="text-lg">Добавить в желаемое</span>
        </p>
      )}
    </>
  );
};

export default AddToWishlistBtn;
