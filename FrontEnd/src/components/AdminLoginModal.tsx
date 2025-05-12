import React, { useState } from 'react';
import { X, Lock, User } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAdminLogin: () => void;
}

const AdminLoginModal: React.FC<AdminModalProps> = ({ isOpen, setIsOpen, onAdminLogin }) => {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegister 
      ? 'https://ebms.up.railway.app/admin/register'
      : 'https://ebms.up.railway.app/admin/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          ...(isRegister && { 
            name: `Admin-${formData.id}`,
            role: 'admin',
            logged_in: new Date().toISOString()
          }),
          ...(!isRegister && { password: formData.password })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();
      if (isRegister) {
        alert(`Admin registered successfully! ID: ${data.admin.id}`);
        setIsRegister(false);
      } else {
        sessionStorage.setItem('adminId', data.admin.id);
        sessionStorage.setItem('adminName', data.admin.name);
        onAdminLogin();
        setIsOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
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
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              placeholder="Password"
              required={!isRegister}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md"
          >
            {isRegister ? 'Register' : 'Login'}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 hover:underline"
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
