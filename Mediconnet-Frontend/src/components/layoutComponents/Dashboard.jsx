import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chart from "../components/Chart";
import Stats from "../components/Stats";

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-4 grid grid-cols-2 gap-4">
          <Stats />
          <Chart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
