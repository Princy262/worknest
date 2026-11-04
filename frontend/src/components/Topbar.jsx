import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, KeyRound, LogOut, User as UserIcon } from 'lucide-react';
import { logoutUser } from '../features/auth/authSlice';
import { ROLE_LABELS } from '../constants';
import { getInitials } from '../utils/format';

const Topbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const organization = user.company?.name || 'WorkNest Platform';

  return (
    <header className="sticky top-0 z-20 h-16 bg-surface border-b border-line px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-dark" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <span className="rounded-full bg-accent/40 text-dark text-sm font-medium px-3 py-1">
          {organization}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-background"
        >
          <span className="h-9 w-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
            {getInitials(user.name)}
          </span>
          <span className="hidden sm:block text-left leading-tight">
            <span className="block text-sm font-medium text-dark">{user.name}</span>
            <span className="block text-xs text-muted">{ROLE_LABELS[user.role]}</span>
          </span>
          <ChevronDown size={16} className="text-muted" />
        </button>

        {menuOpen && (
          <>
            {/* Invisible layer: clicking anywhere else closes the menu */}
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 z-20 bg-surface border border-line rounded-xl shadow-lg py-1">
              <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-background"
                    >
                    <UserIcon size={16} className="text-muted" />
                    My profile
                </Link>
              <Link
                to="/change-password"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-background"
              >
                <KeyRound size={16} className="text-muted" />
                Change password
              </Link>
              <button
                onClick={() => dispatch(logoutUser())}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-background"
              >
                <LogOut size={16} className="text-muted" />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Topbar;