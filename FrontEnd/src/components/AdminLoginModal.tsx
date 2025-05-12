import React, { useState } from 'react';
import { X, Lock, User } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAdminLogin: (adminId: string, adminName: string) => void;
}

const AdminLoginModal: React.FC<AdminModalProps> = ({ isOpen, setIsOpen, onAdminLogin }) => {
  const [formData, setFormData] = useState({ id: '', password: '', name: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateSecureId = (prefix: string = 'admin-'): string => {
    const array = new Uint32Array(5);
    window.crypto.getRandomValues(array);
    return prefix + array.join('').slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister 
      ? 'https://ebms.up.railway.app/admin/register'
      : 'https://ebms.up.railway.app/admin/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: isRegister ? generateSecureId() : formData.id,
          ...(isRegister && { 
            name: formData.name || `Admin-${generateSecureId().slice(0, 4)}`,
            role: 'admin',
            logged_in: new Date().toISOString()
          }),
          ...(!isRegister && { password: formData.password })
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isRegister) {
        alert(`Admin registered successfully! ID: ${data.id || data.admin.id}`);
        setFormData({ id: data.id || data.admin.id, password: '', name: '' });
        setIsRegister(false);
      } else {
        const adminId = data.id || data.admin.id;
        const adminName = data.name || data.admin.name || 'Admin';
        sessionStorage.setItem('adminId', adminId);
        sessionStorage.setItem('adminName', adminName);
        onAdminLogin(adminId, adminName);
        setIsOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      if (isRegister && err instanceof Error && err.message.includes('already exists')) {
        setFormData(prev => ({ ...prev, id: generateSecureId() }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md shadow-lg w-96 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {isRegister ? 'Register Admin' : 'Admin Login'}
          </h3>
          <button 
            onClick={() => {
              setIsOpen(false);
              setError('');
            }} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                placeholder="Admin Name"
              />
            </div>
          )}

          {!isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                placeholder="Admin ID"
                required
              />
            </div>
          )}

          {!isRegister && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                placeholder="Password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md flex justify-center items-center ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : isRegister ? 'Register' : 'Login'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              {isRegister ? 'Already have an account? Login' : 'Need an admin account? Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
