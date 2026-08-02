import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
    isActive ? 'bg-evergreen text-paper' : 'text-paper/80 hover:text-paper hover:bg-evergreen-light'
  }`;

export default function Navbar({ connected }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-evergreen text-paper sticky top-0 z-30 shadow-stamp">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/board" className="flex items-center gap-2 shrink-0">
          <span className="font-display font-bold text-lg tracking-tight">FoodShare</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-mustard-light pulse-dot' : 'bg-tomato'}`}
            title={connected ? 'Live: connected' : 'Live: reconnecting'}
          />
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/board" className={linkClass}>
            Manifest
          </NavLink>
          {user?.role === 'donor' && (
            <>
              <NavLink to="/new-listing" className={linkClass}>
                Post surplus
              </NavLink>
              <NavLink to="/my-listings" className={linkClass}>
                My listings
              </NavLink>
            </>
          )}
          {user?.role === 'receiver' && (
            <NavLink to="/my-claims" className={linkClass}>
              My claims
            </NavLink>
          )}
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-sm text-paper/70 font-mono">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium px-3 py-1.5 rounded-sm border border-paper/30 hover:bg-tomato hover:border-tomato transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <nav className="sm:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        <NavLink to="/board" className={linkClass}>
          Manifest
        </NavLink>
        {user?.role === 'donor' && (
          <>
            <NavLink to="/new-listing" className={linkClass}>
              Post surplus
            </NavLink>
            <NavLink to="/my-listings" className={linkClass}>
              My listings
            </NavLink>
          </>
        )}
        {user?.role === 'receiver' && (
          <NavLink to="/my-claims" className={linkClass}>
            My claims
          </NavLink>
        )}
        <NavLink to="/profile" className={linkClass}>
          Profile
        </NavLink>
      </nav>
    </header>
  );
}
