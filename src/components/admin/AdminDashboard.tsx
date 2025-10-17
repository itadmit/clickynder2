'use client';

import { useState } from 'react';
import { SystemSettings, Subscription, Package, Business } from '@prisma/client';
import {
  Users,
  Building2,
  Settings,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { EditUserModal } from './EditUserModal';
import { SMTPSettingsSection } from './SMTPSettingsSection';
import { toast } from 'react-hot-toast';
import { UserWithBusinesses } from '@/types/admin';

interface AdminDashboardProps {
  users: UserWithBusinesses[];
  systemSettings: SystemSettings[];
}

export function AdminDashboard({ users: initialUsers, systemSettings: initialSettings }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [systemSettings, setSystemSettings] = useState(initialSettings);
  const [sendingTest, setSendingTest] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithBusinesses | null>(null);

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string, userName: string) => {
    // אזהרה ראשונה
    if (!confirm(`⚠️ האם אתה בטוח שברצונך למחוק את המשתמש "${userName}"?\n\nפעולה זו תמחק גם את כל העסקים, התורים והנתונים המשויכים!`)) {
      return;
    }

    // אזהרה שנייה - לוודא שהמשתמש רציני
    const confirmText = prompt(`אנא הקלד את המילה "מחק" כדי לאשר את המחיקה של ${userName}:`);
    if (confirmText !== 'מחק') {
      toast.error('המחיקה בוטלה');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('המשתמש נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'שגיאה במחיקת המשתמש');
    }
  };

  const handleUpdateSystemSetting = async (key: string, value: string) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) throw new Error('Failed to update setting');

      const updatedSetting = await response.json();
      setSystemSettings((prev) => {
        const existing = prev.find((s) => s.key === key);
        if (existing) {
          return prev.map((s) => (s.key === key ? updatedSetting : s));
        } else {
          return [...prev, updatedSetting];
        }
      });

      toast.success('ההגדרה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('שגיאה בעדכון ההגדרה');
    }
  };

  const handleUserUpdated = (updatedUser: UserWithBusinesses) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const getRappelsendClientId = () => {
    return systemSettings.find((s) => s.key === 'rappelsend_client_id')?.value || '';
  };

  const getRappelsendApiToken = () => {
    return systemSettings.find((s) => s.key === 'rappelsend_api_token')?.value || '';
  };

  const handleSendTestMessage = async () => {
    if (!testPhone.trim()) {
      alert('נא להזין מספר טלפון');
      return;
    }

    const clientId = getRappelsendClientId();
    const apiToken = getRappelsendApiToken();

    if (!clientId || !apiToken) {
      alert('נא להזין את פרטי Rappelsend קודם');
      return;
    }

    setSendingTest(true);

    try {
      const response = await fetch('/api/admin/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`✅ הודעה נשלחה בהצלחה ל-${data.normalizedPhone}!`);
        setTestPhone('');
      } else {
        alert(`❌ שגיאה: ${data.error || 'שליחה נכשלה'}`);
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      alert('❌ שגיאה בשליחת הודעה');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                <p className="text-red-100">ניהול מערכת Clickinder</p>
              </div>
            </div>
            <div className="bg-red-700 px-4 py-2 rounded-lg">
              <p className="text-xs text-red-200">גרסה</p>
              <p className="text-lg font-bold">v2.1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-red-600 text-red-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              משתמשים ועסקים
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-red-600 text-red-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              הגדרות מערכת
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="card">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="חפש משתמש לפי שם או אימייל..."
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">סך משתמשים</p>
                    <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                  </div>
                </div>
              </div>

              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">עסקים פעילים</p>
                    <p className="text-2xl font-bold text-green-900">
                      {users.reduce((acc, u) => acc + u.ownedBusinesses.length, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-purple-50 border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Super Admins</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {users.filter((u) => u.isSuperAdmin).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        משתמש
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        עסקים
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        חבילה
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        תורים
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        התחברות אחרונה
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-400">{user.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.ownedBusinesses.length > 0 ? (
                            <div className="space-y-1">
                              {user.ownedBusinesses.map((business) => (
                                <div key={business.id} className="text-sm">
                                  <span className="font-medium">{business.name}</span>
                                  <span className="text-gray-500 mx-2">•</span>
                                  <span className="text-xs text-gray-500">{business.slug}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">אין עסקים</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.ownedBusinesses[0]?.subscription ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.ownedBusinesses[0].subscription.package.name}
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                                  user.ownedBusinesses[0].subscription.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : user.ownedBusinesses[0].subscription.status === 'trial'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {user.ownedBusinesses[0].subscription.status === 'active'
                                  ? 'פעיל'
                                  : user.ownedBusinesses[0].subscription.status === 'trial'
                                  ? 'ניסיון'
                                  : user.ownedBusinesses[0].subscription.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.ownedBusinesses[0]?.appointments?.length || 0}
                          </div>
                          <div className="text-xs text-gray-500">תורים</div>
                        </td>
                        <td className="px-6 py-4">
                          {user.lastLoginAt ? (
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(user.lastLoginAt).toLocaleDateString('he-IL')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(user.lastLoginAt).toLocaleTimeString('he-IL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">לא התחבר</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ערוך משתמש"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="מחק משתמש"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {user.isSuperAdmin && (
                              <div className="mr-2" title="Super Admin">
                                <Shield className="w-4 h-4 text-red-600" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Rappelsend Settings */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">הגדרות Rappelsend</h2>
                  <p className="text-sm text-gray-600">
                    פרטי התחברות לשירות WhatsApp Business
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    defaultValue={getRappelsendClientId()}
                    onBlur={(e) =>
                      handleUpdateSystemSetting('rappelsend_client_id', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="הזן Client ID מ-Rappelsend"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Token
                  </label>
                  <input
                    type="password"
                    defaultValue={getRappelsendApiToken()}
                    onBlur={(e) =>
                      handleUpdateSystemSetting('rappelsend_api_token', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="הזן API Token מ-Rappelsend"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 טיפ:</strong> פרטים אלה ישמשו לשליחת הודעות WhatsApp לכל
                    הלקוחות במערכת.
                    <br />
                    ניתן להשיג פרטים אלה מהחשבון שלך ב-
                    <a
                      href="https://rappelsend.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mx-1"
                    >
                      Rappelsend
                    </a>
                  </p>
                </div>

                {/* Test Message Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    בדיקת שליחת הודעה
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    שלח הודעת WhatsApp לבדיקת החיבור ל-Rappelsend
                  </p>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        placeholder="הזן מספר טלפון (לדוגמה: 0542284283)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        dir="ltr"
                      />
                    </div>
                    <button
                      onClick={handleSendTestMessage}
                      disabled={sendingTest || !testPhone.trim()}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingTest ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          שולח...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5" />
                          שלח הודעת ניסיון
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700">
                      💬 תוכן ההודעה: "שלום! זוהי הודעת ניסיון מ-Clickinder. המערכת שלך
                      מחוברת בהצלחה ל-WhatsApp Business דרך Rappelsend! ✅"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google SMTP Settings */}
            <SMTPSettingsSection />

            {/* Other System Settings */}
            <div className="card">
              <h2 className="text-xl font-bold mb-6">הגדרות מערכת נוספות</h2>
              <div className="space-y-4">
                {systemSettings
                  .filter(
                    (s) => !s.key.startsWith('rappelsend_') && !s.key.startsWith('smtp_')
                  )
                  .map((setting) => (
                    <div key={setting.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{setting.key}</div>
                          {setting.description && (
                            <div className="text-sm text-gray-500">{setting.description}</div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{setting.value}</div>
                      </div>
                    </div>
                  ))}
                {systemSettings.filter((s) => !s.key.startsWith('rappelsend_')).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    אין הגדרות נוספות
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleUserUpdated}
        />
      )}
    </div>
  );
}

