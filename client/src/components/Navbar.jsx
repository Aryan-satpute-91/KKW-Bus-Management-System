import { useAuth } from '../context/useAuth';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onMenuClick, title }) => {
  const { isAdmin } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-surface-highest flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shadow-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-surface-low transition-colors"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      <h2 className="text-base font-semibold text-primary hidden lg:block">{title}</h2>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Admin Notifications */}
        {isAdmin && <NotificationDropdown />}

        {/* Institution badge */}
        <div className="hidden sm:flex items-center gap-2 bg-surface-low rounded-full px-3 py-1.5">
          <span className="material-symbols-outlined text-secondary text-base">school</span>
          <span className="text-xs font-medium text-gray-600">K.K. Wagh Institute</span>
        </div>

        {/* Current date */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
          <span className="material-symbols-outlined text-base">calendar_today</span>
          <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
