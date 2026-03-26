import { useState, useEffect } from 'react';
import type { ReleaseRecord } from '../types';
import { STORE_OPTIONS } from '../types';
import { FaCheckCircle, FaTimesCircle, FaClock, FaRedo } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ReleasesPage() {
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReleases(); }, []);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/releases`);
      const data = await res.json();
      if (data.success) setReleases(data.data || []);
    } finally { setLoading(false); }
  };

  const getStoreColor = (type: string) => STORE_OPTIONS.find(s => s.type === type)?.color || '#999';
  const getStoreName = (type: string) => STORE_OPTIONS.find(s => s.type === type)?.name || type;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">发布记录</h1>
          <p className="text-gray-500 mt-1">查看各应用商店的发布历史</p>
        </div>
        <button onClick={fetchReleases} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <FaRedo className="w-4 h-4" />刷新
        </button>
      </div>

      {loading && <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}
      
      {!loading && releases.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-700">暂无发布记录</h3>
        </div>
      )}

      {!loading && releases.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">应用</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商店</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">版本</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {releases.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{r.app?.name}</p>
                    <p className="text-xs text-gray-500">{r.app?.packageName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStoreColor(r.storeType) }} />
                      <span className="text-sm">{getStoreName(r.storeType)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">v{r.versionName} ({r.versionCode})</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {r.status === 'success' ? <FaCheckCircle className="text-green-500" /> : r.status === 'failed' ? <FaTimesCircle className="text-red-500" /> : <FaClock className="text-yellow-500" />}
                      <span className={`text-xs px-2 py-1 rounded ${r.status === 'success' ? 'bg-green-100 text-green-700' : r.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.status === 'success' ? '成功' : r.status === 'failed' ? '失败' : '发布中'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.createdAt).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
