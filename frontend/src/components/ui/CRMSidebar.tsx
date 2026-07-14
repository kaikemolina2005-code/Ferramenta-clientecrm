import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Settings,
  BarChart2,
  FileText,
  MessageSquare,
  Brain,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { designSystem } from '@/theme/designSystem';

const PRIMARY = designSystem.colors.primary.dark;    // azul escuro
const GOLD = designSystem.colors.accent.gold;        // dourado
const WHITE = designSystem.colors.neutral.white;

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/leads',      icon: Users,             label: 'Leads' },
  { to: '/kanban',     icon: Kanban,            label: 'CRM' },
  { to: '/tarefas',    icon: CheckSquare,       label: 'Tarefas' },
  { to: '/automation', icon: Settings,          label: 'Automações' },
  { to: '/reports',    icon: BarChart2,         label: 'Relatórios' },
  { to: '/whatsapp',   icon: MessageSquare,     label: 'WhatsApp' },
  { to: '/ai',         icon: Brain,             label: 'IA Documents' },
];

const sidebarVariants = {
  open:   { width: '15rem' },
  closed: { width: '3.5rem' },
};

const labelVariants = {
  open:   { opacity: 1, x: 0,   display: 'block' },
  closed: { opacity: 0, x: -10, transitionEnd: { display: 'none' } },
};

const transition = { type: 'tween' as const, ease: 'easeOut', duration: 0.2 };

export function CRMSidebar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="closed"
      animate={open ? 'open' : 'closed'}
      transition={transition}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative h-screen z-40 flex flex-col shrink-0 overflow-hidden"
      style={{
        backgroundColor: PRIMARY,
        borderRight: `2px solid ${GOLD}`,
        boxShadow: '4px 0 16px rgba(0,0,0,0.25)',
      }}
    >
      {/* Logo area */}
      <div
        className="flex items-center h-[54px] shrink-0 border-b px-3 gap-3"
        style={{ borderColor: GOLD, background: 'linear-gradient(135deg, #003f7f 0%, #0d47a1 100%)' }}
      >
        {/* Avatar / logo */}
        <div
          className="flex items-center justify-center rounded-lg shrink-0 font-bold text-xs"
          style={{ width: 28, height: 28, backgroundColor: GOLD, color: PRIMARY }}
        >
          AD
        </div>
        <motion.div variants={labelVariants} transition={transition} className="overflow-hidden whitespace-nowrap">
          <p className="text-sm font-bold leading-tight" style={{ color: WHITE }}>
            ADVGD CRM
          </p>
          <p className="text-xs leading-tight" style={{ color: designSystem.colors.accent.light }}>
            Diego Patrício
          </p>
        </motion.div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors duration-150 group"
              style={{
                color: WHITE,
                backgroundColor: active ? `rgba(201,169,97,0.22)` : 'transparent',
                borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <Icon
                size={18}
                className="shrink-0"
                style={{ color: active ? GOLD : WHITE }}
              />
              <motion.span
                variants={labelVariants}
                transition={transition}
                className="text-sm font-medium overflow-hidden whitespace-nowrap"
                style={{ color: active ? GOLD : WHITE }}
              >
                {label}
              </motion.span>
              {open && active && (
                <ChevronRight size={14} className="ml-auto shrink-0" style={{ color: GOLD }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User area */}
      <div
        className="border-t p-2 shrink-0"
        style={{ borderColor: GOLD }}
      >
        <div className="flex items-center gap-3 px-1 py-2">
          {/* Avatar circle */}
          <div
            className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
            style={{ width: 28, height: 28, backgroundColor: GOLD, color: PRIMARY }}
          >
            {initials}
          </div>
          <motion.div variants={labelVariants} transition={transition} className="flex-1 overflow-hidden whitespace-nowrap min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: WHITE }}>
              {user?.name}
            </p>
            <p className="text-xs opacity-60 truncate" style={{ color: designSystem.colors.accent.light }}>
              {user?.role}
            </p>
          </motion.div>
          <motion.button
            variants={labelVariants}
            transition={transition}
            onClick={handleLogout}
            className="shrink-0 p-1.5 rounded-lg transition-colors"
            title="Sair"
            style={{ color: designSystem.colors.status.error }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={15} />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
