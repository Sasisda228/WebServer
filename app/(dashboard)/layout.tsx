import axios from "axios";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: {
    user: { name: string; email: string; image: string };
  } | null = await getServerSession();

  if (!session) {
    redirect("/");
  }

  let email: string = await session?.user?.email;

  const res = await axios.get(`/api/users/email/${email}`);
  const data = res.data;
  // redirecting user to the home page if not admin
  if (data.role === "user") {
    redirect("/");
  }

  return <>{children}</>;
}
