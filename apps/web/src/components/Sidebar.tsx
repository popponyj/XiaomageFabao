import { NavLink } from 'react-router-dom';
import { FaHome, FaMobileAlt, FaHistory } from 'react-icons/fa';

const menuItems = [
  { path: '/', label: '首页', icon: FaHome },
  { path: '/apps', label: '应用管理', icon: FaMobileAlt },
  { path: '/releases', label: '发布记录', icon: FaHistory },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-orange-500">🚀</span>
          小马哥发包
        </h1>
        <p className="text-xs text-gray-500 mt-1">应用商店自动更新管理</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-400 text-center">小马哥发包 v1.0.0</div>
      </div>
    </aside>
  );
}
