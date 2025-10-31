
import React from 'react';
import { Icon } from './Icon';

const NavItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active = false }) => {
    const activeClasses = 'bg-slate-700 text-white';
    const inactiveClasses = 'text-slate-400 hover:bg-slate-800 hover:text-white';
    return (
        <a href="#" className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${active ? activeClasses : inactiveClasses}`}>
            <Icon name={icon} className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </a>
    );
};

const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-[#1E293B] p-4 flex flex-col flex-shrink-0">
            <div className="flex-grow">
                <div className="flex items-center mb-8">
                    <img src="https://picsum.photos/40/40" alt="Avatar" className="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <p className="font-semibold text-white">Minh Anh</p>
                        <p className="text-xs text-slate-400">Gói miễn phí</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    <NavItem icon="plus-circle" label="Tạo mới" active={true} />
                    <NavItem icon="image" label="Tác phẩm của tôi" />
                    <NavItem icon="compass" label="Khám phá" />
                </nav>
            </div>

            <div className="flex-shrink-0">
                 <button className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-6">
                    Nâng cấp ngay
                </button>
                <nav className="space-y-2">
                    <NavItem icon="settings" label="Cài đặt" />
                    <NavItem icon="help" label="Trợ giúp" />
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
