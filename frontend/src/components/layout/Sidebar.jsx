import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, Users, Settings,
  Sparkles, LogOut, ChevronRight, Zap
} from 'lucide-react';
import { logout } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/new-invoice', icon: PlusCircle, label: 'New Invoice' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
  { to: '/profile', icon: Settings, label: 'Business Profile' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const displayName = user?.isAnonymous ? 'Guest User' : (user?.displayName || user?.email || 'User');
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-[#0F1115] flex flex-col z-40 select-none">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">InvoiceAI</span>
            {user?.isAnonymous && (
              <span className="block text-[10px] text-amber-400 font-medium">Guest Mode</span>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">Menu</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item group ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={`sidebar-icon shrink-0 transition-colors ${isActive ? 'text-[#2563EB]' : 'text-white/40 group-hover:text-white/70'}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-[#2563EB]/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={initials} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            {!user?.isAnonymous && user?.email && (
              <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full hover:!text-red-400 hover:!bg-red-500/10"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
