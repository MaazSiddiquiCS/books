import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const LoginModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isSignup ? 'Signup submitted' : 'Login submitted', { email, password });
    setIsOpen(false);
  };

  const passwordStrength = () => {
    if (password.length >= 8) return 'Strong';
    if (password.length >= 5) return 'Medium';
    return 'Weak';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
        <div className="text-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isSignup ? 'Create an Account' : 'Login to Your Account'}
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Name"
                required
                className="w-full pl-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full pl-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={8}
              className="w-full pl-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
            {isSignup && (
              <p className={`text-sm mt-1 ${passwordStrength() === 'Strong' ? 'text-green-500' : passwordStrength() === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                Password strength: {passwordStrength()}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            {isSignup ? 'Sign up' : 'Sign in'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isSignup ? 'Already have an account? Log in' : 'Don’t have an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
