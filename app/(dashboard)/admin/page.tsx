import dynamic from "next/dynamic";
import { FaArrowUp } from "react-icons/fa6";

// Динамически загружаем компоненты
const DashboardSidebar = dynamic(
  () => import("@/components/DashboardSidebar"),
  {
    loading: () => <p>Loading Sidebar...</p>,
  }
);

const StatsElement = dynamic(() => import("@/components/StatsElement"), {
  loading: () => <p>Loading Stats...</p>,
});
const AdminDashboardPage = () => {
  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex flex-col items-center ml-5 gap-y-4 w-full max-xl:ml-0 max-xl:px-2 max-xl:mt-5 max-md:gap-y-1">
        <div className="flex justify-between w-full max-md:flex-col max-md:w-full max-md:gap-y-1">
          <StatsElement />
          <StatsElement />
          <StatsElement />
        </div>
        <div className="w-full bg-blue-500 text-white h-40 flex flex-col justify-center items-center gap-y-2">
          <h4 className="text-3xl text-gray-100 max-[400px]:text-2xl">
            Number of visitors today
          </h4>
          <p className="text-3xl font-bold">1200</p>
          <p className="text-green-300 flex gap-x-1 items-center">
            <FaArrowUp />
            12.5% Since last month
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
