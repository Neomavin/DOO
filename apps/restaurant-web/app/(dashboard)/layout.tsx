import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-black text-brand-gray">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#080f1d] p-6">{children}</main>
      </div>
    </div>
  );
}
