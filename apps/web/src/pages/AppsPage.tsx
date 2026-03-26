import { useState, useEffect } from 'react';
import type { App, StoreAccount } from '../types';
import { STORE_OPTIONS } from '../types';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaRocket, FaMobileAlt, FaStore, FaChevronDown, FaChevronUp, FaSync } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [appForm, setAppForm] = useState({ name: '', packageName: '' });
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [editingStore, setEditingStore] = useState<StoreAccount | null>(null);
  const [storeForm, setStoreForm] = useState({ storeType: '', storeName: '', email: '', privateKey: '', publicKey: '', desc: '', brief: '', updateDesc: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingStore, setUploadingStore] = useState<StoreAccount | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadVersionName, setUploadVersionName] = useState('');
  const [uploadVersionCode, setUploadVersionCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [refreshingVersion, setRefreshingVersion] = useState<string | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releasingStore, setReleasingStore] = useState<StoreAccount | null>(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/apps`);
      const data = await res.json();
      if (data.success) setApps(data.data || []);
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingApp ? `${API_BASE_URL}/apps/${editingApp.id}` : `${API_BASE_URL}/apps`;
      const res = await fetch(url, { method: editingApp ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(appForm) });
      const data = await res.json();
      if (data.success) {
        setShowAppModal(false);
        setEditingApp(null);
        setAppForm({ name: '', packageName: '' });
        fetchApps();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (err) {
      alert('网络错误，请检查后端服务');
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm('确定删除？')) return;
    await fetch(`${API_BASE_URL}/apps/${id}`, { method: 'DELETE' });
    fetchApps();
  };

  const handleDeleteStore = async (appId: string, storeId: string) => {
    if (!confirm('确定删除这个商店配置？')) return;
    await fetch(`${API_BASE_URL}/apps/${appId}/store-accounts/${storeId}`, { method: 'DELETE' });
    fetchApps();
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSaveStore called, selectedApp:', selectedApp);
    console.log('storeForm:', storeForm);
    
    if (!selectedApp) {
      alert('请先选择应用');
      return;
    }
    
    // 表单验证
    if (!storeForm.storeType && !editingStore) {
      alert('请选择应用商店');
      return;
    }
    if (!storeForm.email) {
      alert('请填写开发者邮箱');
      return;
    }
    if (!storeForm.privateKey && !editingStore) {
      alert('请填写RSA私钥');
      return;
    }
    if (!storeForm.publicKey && !editingStore) {
      alert('请填写RSA公钥');
      return;
    }
    
    try {
      const url = editingStore 
        ? `${API_BASE_URL}/apps/${selectedApp.id}/store-accounts/${editingStore.id}` 
        : `${API_BASE_URL}/apps/${selectedApp.id}/store-accounts`;
      console.log('Sending request to:', url);
      const res = await fetch(url, { 
        method: editingStore ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(storeForm) 
      });
      const data = await res.json();
      console.log('Response:', data);
      if (data.success) {
        setShowStoreModal(false);
        setEditingStore(null);
        setStoreForm({ storeType: '', storeName: '', email: '', privateKey: '', publicKey: '', desc: '', brief: '', updateDesc: '' });
        fetchApps();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('网络错误，请检查后端服务');
    }
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadingStore) return;
    if (!uploadVersionName.trim() || !uploadVersionCode.trim()) {
      alert('请填写版本名称和版本编码');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('apk', selectedFile);
    formData.append('versionName', uploadVersionName.trim());
    formData.append('versionCode', uploadVersionCode.trim());
    try {
      const res = await fetch(`${API_BASE_URL}/upload/${uploadingStore.id}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setShowUploadModal(false);
        setUploadVersionName('');
        setUploadVersionCode('');
        setSelectedFile(null);
        fetchApps();
      } else {
        alert(data.error || '上传失败');
      }
    } catch (err) {
      alert('上传失败，请检查网络');
    } finally {
      setUploading(false);
    }
  };

  const openReleaseModal = (store: StoreAccount) => {
    if (!store.apkPath) {
      alert('请先上传APK文件');
      return;
    }
    setReleasingStore(store);
    setShowReleaseModal(true);
  };

  const handleRelease = async () => {
    if (!releasingStore) return;
    setReleasing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/releases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storeAccountId: releasingStore.id }) });
      const data = await res.json();
      if (data.success) {
        setShowReleaseModal(false);
        setReleasingStore(null);
        fetchApps();
      } else {
        alert(`发布失败: ${data.error}`);
      }
    } catch (err) {
      alert('网络错误，请检查后端服务');
    } finally {
      setReleasing(false);
    }
  };

  const openAppModal = (app?: App) => {
    if (app) { setEditingApp(app); setAppForm({ name: app.name, packageName: app.packageName }); }
    else { setEditingApp(null); setAppForm({ name: '', packageName: '' }); }
    setShowAppModal(true);
  };

  const openStoreModal = async (app: App, store?: StoreAccount) => {
    setSelectedApp(app);
    if (store) {
      setEditingStore(store);
      // 获取完整配置（包含私钥公钥）用于回显
      try {
        const res = await fetch(`${API_BASE_URL}/apps/${app.id}/store-accounts/${store.id}`);
        const data = await res.json();
        if (data.success) {
          setStoreForm({
            storeType: data.data.storeType,
            storeName: data.data.storeName,
            email: data.data.email,
            privateKey: data.data.privateKey || '',
            publicKey: data.data.publicKey || '',
            desc: data.data.desc || '',
            brief: data.data.brief || '',
            updateDesc: data.data.updateDesc || '',
          });
        } else {
          setStoreForm({ storeType: store.storeType, storeName: store.storeName, email: store.email, privateKey: '', publicKey: '', desc: '', brief: '', updateDesc: '' });
        }
      } catch {
        setStoreForm({ storeType: store.storeType, storeName: store.storeName, email: store.email, privateKey: '', publicKey: '', desc: '', brief: '', updateDesc: '' });
      }
    } else {
      setEditingStore(null);
      setStoreForm({ storeType: '', storeName: '', email: '', privateKey: '', publicKey: '', desc: '', brief: '', updateDesc: '' });
    }
    setShowStoreModal(true);
  };

  const toggleExpand = (appId: string) => {
    const newSet = new Set(expandedApps);
    newSet.has(appId) ? newSet.delete(appId) : newSet.add(appId);
    setExpandedApps(newSet);
  };

  const handleRefreshStoreVersion = async (store: StoreAccount) => {
    setRefreshingVersion(store.id);
    try {
      const res = await fetch(`${API_BASE_URL}/releases/store-version/${store.id}`);
      const data = await res.json();
      if (data.success) {
        fetchApps();
      } else {
        alert(`查询失败: ${data.error}`);
      }
    } catch (err) {
      alert('查询失败，请检查网络');
    } finally {
      setRefreshingVersion(null);
    }
  };

  const getStoreColor = (type: string) => STORE_OPTIONS.find(s => s.type === type)?.color || '#999';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">应用管理</h1>
          <p className="text-gray-500 mt-1">先创建应用，再配置各商店账号</p>
        </div>
        <button onClick={() => openAppModal()} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          <FaPlus className="w-4 h-4" />添加应用
        </button>
      </div>

      {loading && <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}
      {!loading && apps.length === 0 && <div className="text-center py-12 bg-gray-50 rounded-lg"><div className="text-4xl mb-4">📱</div><h3 className="text-lg font-medium text-gray-700">暂无应用</h3></div>}

      {!loading && apps.length > 0 && (
        <div className="space-y-4">
          {apps.map(app => (
            <div key={app.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><FaMobileAlt className="w-6 h-6 text-blue-500" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{app.name}</h3>
                    <p className="text-sm text-gray-500">{app.packageName}</p>
                    <p className="text-xs text-gray-400 mt-1">{app.storeAccounts?.length || 0} 个商店配置</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleExpand(app.id)} className="p-2 text-gray-400 hover:text-gray-600">
                    {expandedApps.has(app.id) ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  <button onClick={() => openStoreModal(app)} className="p-2 text-gray-400 hover:text-green-600" title="添加商店"><FaStore /></button>
                  <button onClick={() => openAppModal(app)} className="p-2 text-gray-400 hover:text-blue-600"><FaEdit /></button>
                  <button onClick={() => handleDeleteApp(app.id)} className="p-2 text-gray-400 hover:text-red-600"><FaTrash /></button>
                </div>
              </div>

              {expandedApps.has(app.id) && (
                <div className="border-t border-gray-100 px-6 pb-6">
                  <h4 className="text-sm font-medium text-gray-600 mt-4 mb-3">商店配置</h4>
                  {app.storeAccounts?.length === 0 ? <p className="text-gray-400 text-sm">暂无商店配置</p> : (
                    <div className="grid gap-3">
                      {app.storeAccounts?.map(store => (
                        <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getStoreColor(store.storeType) }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-gray-800">{store.storeName}</p>
                                {store.apkPath && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex-shrink-0">✓ APK</span>}
                              </div>
                              <p className="text-xs text-gray-500">{store.email}</p>
                              {/* 版本信息展示 */}
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400">商店版本:</span>
                                  <span className={`font-medium ${store.storeVersionName ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {store.storeVersionName || '未获取'}
                                  </span>
                                  <button
                                    onClick={() => handleRefreshStoreVersion(store)}
                                    disabled={refreshingVersion === store.id}
                                    className="ml-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                                    title="刷新商店版本"
                                  >
                                    <FaSync className={`w-3 h-3 ${refreshingVersion === store.id ? 'animate-spin' : ''}`} />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400">APK版本:</span>
                                  <span className={`font-medium ${store.versionName ? 'text-orange-600' : 'text-gray-400'}`}>
                                    {store.versionName || '未上传'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <button onClick={() => { setUploadingStore(store); setShowUploadModal(true); }} title="上传APK" className="p-2 text-gray-400 hover:text-blue-600"><FaUpload /></button>
                            <button onClick={() => openReleaseModal(store)} title="发布到商店" className="p-2 text-gray-400 hover:text-green-600"><FaRocket /></button>
                            <button onClick={() => openStoreModal(app, store)} title="编辑配置" className="p-2 text-gray-400 hover:text-blue-600"><FaEdit /></button>
                            <button onClick={() => handleDeleteStore(app.id, store.id)} title="删除配置" className="p-2 text-gray-400 hover:text-red-600"><FaTrash /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* App Modal */}
      {showAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingApp ? '编辑应用' : '添加应用'}</h2>
            <form onSubmit={handleSaveApp} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">应用名称</label><input type="text" value={appForm.name} onChange={e => setAppForm({ ...appForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">包名</label><input type="text" value={appForm.packageName} onChange={e => setAppForm({ ...appForm, packageName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="com.example.app" required /></div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAppModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">取消</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editingStore ? '编辑商店配置' : '添加商店配置'} - {selectedApp?.name}</h2>
            <form onSubmit={handleSaveStore} className="space-y-4">
              {!editingStore && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">应用商店</label>
                  <select value={storeForm.storeType} onChange={e => { const s = STORE_OPTIONS.find(x => x.type === e.target.value); setStoreForm({ ...storeForm, storeType: e.target.value, storeName: s?.name || '' }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="">选择商店</option>
                    {STORE_OPTIONS.map(s => <option key={s.type} value={s.type}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">开发者邮箱</label><input type="email" value={storeForm.email} onChange={e => setStoreForm({ ...storeForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">访问密码（开发者站"私钥"）</label><textarea value={storeForm.privateKey} onChange={e => setStoreForm({ ...storeForm, privateKey: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs" rows={2} required={!editingStore} placeholder="小米开发者站获取的访问密码（短字符串）" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">小米公钥</label><textarea value={storeForm.publicKey} onChange={e => setStoreForm({ ...storeForm, publicKey: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs" rows={3} required={!editingStore} placeholder="小米开发者站分配的RSA公钥（长base64字符串）" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">应用详情</label><textarea value={storeForm.desc} onChange={e => setStoreForm({ ...storeForm, desc: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} placeholder="应用详细介绍" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">一句话简介</label><input type="text" value={storeForm.brief} onChange={e => setStoreForm({ ...storeForm, brief: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="简短描述应用" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">更新说明</label><textarea value={storeForm.updateDesc} onChange={e => setStoreForm({ ...storeForm, updateDesc: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} placeholder="本次版本更新内容" /></div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowStoreModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">取消</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && uploadingStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold">上传 APK</h2>
            <p className="text-sm text-gray-500 mb-4">{uploadingStore.storeName}</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版本名称</label>
                <input type="text" value={uploadVersionName} onChange={e => setUploadVersionName(e.target.value)} placeholder="例如: 1.0.0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版本编码</label>
                <input type="text" value={uploadVersionCode} onChange={e => setUploadVersionCode(e.target.value)} placeholder="例如: 1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input type="file" accept=".apk" onChange={handleSelectFile} className="hidden" id="apk-upload" />
              <label htmlFor="apk-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3"><FaUpload className="w-6 h-6 text-orange-500" /></div>
                <p className="text-gray-700 font-medium text-sm">{selectedFile ? selectedFile.name : '点击选择 APK 文件'}</p>
                {selectedFile && <p className="text-xs text-gray-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>}
              </label>
            </div>
            {uploading && <p className="text-center mt-4 text-blue-500 text-sm">上传中...</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">取消</button>
              <button onClick={handleUpload} disabled={uploading || !selectedFile} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">上传</button>
            </div>
          </div>
        </div>
      )}

      {/* Release Confirm Modal */}
      {showReleaseModal && releasingStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaRocket className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">确认发布</h2>
                <p className="text-sm text-gray-500">{releasingStore.storeName}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">即将发布应用到以下商店：</p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STORE_OPTIONS.find(s => s.type === releasingStore.storeType)?.color || '#999' }} />
                <span className="font-medium text-gray-800">{releasingStore.storeName}</span>
              </div>
              {releasingStore.versionName && (
                <p className="text-xs text-gray-500 mt-2">APK版本: {releasingStore.versionName}</p>
              )}
            </div>
            {releasing && (
              <div className="flex items-center justify-center gap-2 mb-4 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">发布中，请稍候...</span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowReleaseModal(false)} disabled={releasing} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50">取消</button>
              <button onClick={handleRelease} disabled={releasing} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {releasing ? '发布中...' : '确认发布'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
