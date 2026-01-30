import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/stores', label: 'Stores' },
  { path: '/products', label: 'Products' },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Tiny Inventory
              </Link>
            </div>
            <nav className="ml-10 flex space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      inline-flex items-center px-1 pt-1 text-sm font-medium
                      border-b-2 transition-colors duration-200
                      ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
