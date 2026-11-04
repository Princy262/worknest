import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { logoutUser } from '../features/auth/authSlice';
import { NAV_ITEMS } from '../navigation';
import { ROLE_LABELS } from '../constants';

const Sidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const items = NAV_ITEMS[user.role] || [];

  return (
    <>
      {/* Dark overlay behind the menu on small screens */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/worknest-icon.png" alt="" className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-semibold tracking-tight">
              Work<span className="text-secondary">Nest</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Menu for this role */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Who is logged in + log out */}
        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-white/50 mb-3">{ROLE_LABELS[user.role]}</p>
          <button
            onClick={() => dispatch(logoutUser())}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;