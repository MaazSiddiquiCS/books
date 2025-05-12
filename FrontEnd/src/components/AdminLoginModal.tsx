import React, { useState } from 'react';
import { X, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AdminLoginModal: React.FC<AdminModalProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isRegister) {
        alert(`Admin registered successfully! ID: ${data.id || data.admin?.id}`);
        setIsRegister(false);
      } else {
        const adminId = data.id || data.admin?.id;
        const adminName = data.name || data.admin?.name || `Admin-${adminId}`;
        
        sessionStorage.setItem('adminId', adminId);
        sessionStorage.setItem('adminName', adminName);
        setIsOpen(false);
        navigate('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
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
            onClick={() => setIsOpen(false)} 
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
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
              disabled={loading}
            />
          </div>

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
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 hover:underline"
              disabled={loading}
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
