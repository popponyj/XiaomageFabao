import { useState, useEffect } from 'react';
import type { App, ReleaseRecord } from '../types';
import { STORE_OPTIONS } from '../types';
import { FaMobileAlt, FaRocket, FaStore } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function DashboardPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, releasesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/apps`),
        fetch(`${API_BASE_URL}/releases`),
      ]);
      const appsData = await appsRes.json();
      const releasesData = await releasesRes.json();
      if (appsData.success) setApps(appsData.data || []);
      if (releasesData.success) setReleases(releasesData.data || []);
    } finally { setLoading(false); }
  };

  const storeCount = apps.reduce((sum, app) => sum + (app.storeAccounts?.length || 0), 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">控制台</h1>
        <p className="text-gray-500 mt-1">欢迎使用小马哥发包</p>
      </div>

      {loading ? <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">应用数量</p><p className="text-3xl font-bold text-gray-800 mt-1">{apps.length}</p></div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center"><FaMobileAlt className="w-6 h-6 text-white" /></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">商店配置</p><p className="text-3xl font-bold text-gray-800 mt-1">{storeCount}</p></div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center"><FaStore className="w-6 h-6 text-white" /></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">发布记录</p><p className="text-3xl font-bold text-gray-800 mt-1">{releases.length}</p></div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center"><FaRocket className="w-6 h-6 text-white" /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">快速操作</h2>
              <div className="space-y-3">
                <a href="#/apps" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FaMobileAlt className="w-5 h-5 text-blue-500" /></div>
                  <div><p className="font-medium text-gray-800">管理应用</p><p className="text-sm text-gray-500">添加应用或配置商店</p></div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">最近发布</h2>
              {releases.slice(0, 5).length === 0 ? <p className="text-gray-500 text-center py-4">暂无发布记录</p> : (
                <div className="space-y-3">
                  {releases.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STORE_OPTIONS.find(s => s.type === r.storeType)?.color || '#999' }} />
                        <div><p className="font-medium text-gray-800">{r.app?.name}</p><p className="text-xs text-gray-500">{STORE_OPTIONS.find(s => s.type === r.storeType)?.name} · v{r.versionName}</p></div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${r.status === 'success' ? 'bg-green-100 text-green-700' : r.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.status === 'success' ? '成功' : r.status === 'failed' ? '失败' : '中'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
