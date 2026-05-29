import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationResponse, UserRole } from '@superbom/shared';
import {
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
  History,
  FileBarChart2,
  Users as UsersIcon,
  ShieldCheck,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get<NotificationResponse[]>('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error('Erro ao buscar notificações no layout:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // atualiza a cada 20s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      setIsNotifOpen(false);
      navigate('/notifications');
    } catch (e) {
      console.error(e);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.SUPERVISOR, UserRole.CAIXA],
    },
    {
      name: 'Novo Fechamento',
      path: '/closings/new',
      icon: PlusCircle,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.CAIXA],
    },
    {
      name: 'Histórico de Fechamentos',
      path: '/closings',
      icon: History,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.SUPERVISOR, UserRole.CAIXA],
    },
    {
      name: 'Relatórios Consolidados',
      path: '/reports',
      icon: FileBarChart2,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.SUPERVISOR],
    },
    {
      name: 'Usuários',
      path: '/users',
      icon: UsersIcon,
      roles: [UserRole.ADMIN],
    },
    {
      name: 'Auditoria de Ações',
      path: '/audit',
      icon: ShieldCheck,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.SUPERVISOR],
    },
  ];

  const allowedMenuItems = menuItems.filter((item) => hasRole(item.roles));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-800 bg-slate-900/50">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            S
          </div>
          <span className="text-lg font-black text-slate-100 tracking-tight">Super Bom <span className="text-indigo-400 font-medium">Caixa</span></span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
          >
            <LogOut size={18} />
            Sair do Aplicativo
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
          <aside className="w-72 bg-slate-900 h-full flex flex-col border-r border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">S</div>
                <span className="text-lg font-black text-slate-100">Super Bom</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {allowedMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">S</div>
              <span className="text-base font-black text-slate-200 tracking-tight">Super Bom</span>
            </div>
            <div className="hidden lg:block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block leading-none">Padaria 24h</span>
              <span className="text-sm font-bold text-slate-300">Fechamento Diário</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Sino de Notificações */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsUserMenuOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl relative transition"
              >
                <Bell size={20} className={unreadCount > 0 ? 'animate-swing' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-[10px] font-black text-white rounded-full flex items-center justify-center border border-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notificações */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Notificações</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          Ler todas
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">Nenhuma notificação por aqui.</div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif.id)}
                            className={`p-3 text-left hover:bg-slate-800/30 cursor-pointer transition ${
                              !notif.read ? 'bg-slate-800/10' : ''
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              {!notif.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                              <span className="text-xs font-bold text-slate-200">{notif.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      onClick={() => setIsNotifOpen(false)}
                      className="block text-center py-2.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 border-t border-slate-800 bg-slate-900/50"
                    >
                      Ver tudo
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Menu do Usuário */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-2 p-1 md:px-3 md:py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                  <UserIcon size={16} />
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold block leading-none">{user?.name}</span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase block mt-1 tracking-wider">{user?.role}</span>
                </div>
                <ChevronDown size={14} className="hidden md:block text-slate-500" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 py-1">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <span className="text-xs text-slate-500 font-semibold uppercase leading-none block">Identificação</span>
                      <span className="text-xs font-bold text-slate-300 block mt-1 truncate">{user?.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut size={14} />
                      Sair da Conta
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
