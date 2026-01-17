import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Settings, Home } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: '홈', icon: <Home size={20} /> },
  { path: '/study', label: '학습', icon: <BookOpen size={20} /> },
  { path: '/settings', label: '설정', icon: <Settings size={20} /> },
];

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 safe-area-bottom">
      <ul className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <li key={item.path} className="flex-1">
            <Link
              to={item.path}
              className="flex flex-col items-center justify-center h-full relative"
            >
              <motion.div
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                  isActive(item.path)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {/* 활성 인디케이터 */}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* 아이콘 */}
                <motion.div
                  animate={{
                    scale: isActive(item.path) ? 1.1 : 1,
                    y: isActive(item.path) ? -2 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {item.icon}
                </motion.div>

                {/* 라벨 */}
                <span className={`text-xs mt-1 font-medium ${
                  isActive(item.path) ? 'opacity-100' : 'opacity-70'
                }`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
