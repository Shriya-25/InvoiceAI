import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
