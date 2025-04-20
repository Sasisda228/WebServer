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

  let email: string = session?.user?.email;

  // Use absolute URL for server-side axios call
  const baseUrl = "http://212.67.12.199:3000";
  const res = await axios.get(`${baseUrl}/api/users/email/${email}`);
  const data = res.data;
  // redirecting user to the home page if not admin
  if (data.role === "user") {
    redirect("/");
  }

  return <>{children}</>;
}
