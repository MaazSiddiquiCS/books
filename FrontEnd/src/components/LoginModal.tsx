import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import{getUserByEmail} from 'pages/api'
import { Result } from 'postcss';
interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const LoginModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState({ id:'', name: '', email: '', password: '' });
  const [isSignup, setIsSignup] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Check if user is already logged in (session check)
    const loggedInEmail = sessionStorage.getItem('userEmail');
    if (loggedInEmail) {
      alert('A user is already logged in. Please log out first.');
      return;
    }
    const User_Email = sessionStorage.getItem('userEmail');



    // Check if required fields are present
    if (!formData.email || !formData.password || (isSignup && !formData.name)) {
      alert('Please fill in all required fields.');
      return;
    }
  
    const endpoint = isSignup ? `https://ebms.up.railway.app/user/signup` : `https://ebms.up.railway.app/user/login`;
  
    // Ensure the correct data is sent
    const data = isSignup
      ? { username: formData.name, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };
  
    try {
      console.log(`Sending ${isSignup ? 'signup' : 'login'} request to ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const contentType = response.headers.get('Content-Type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const result = await response.json();
        alert(isSignup ? 'Signup successful. Please log in.' : 'Login successful');
        console.log('Server response:', result);
        
        if (isSignup) {
          // Switch to login mode after successful signup
          setIsSignup(false);
          setFormData({ id: '', name: '', email: '', password: '' }); // Clear the form
        } else {
          // Store session info on successful login
          sessionStorage.setItem('userEmail', formData.email);
          const user_id = await getUserByEmail(formData.email);
          console.log(user_id[0].user_id);
          sessionStorage.setItem('userID', user_id[0].user_id);
          sessionStorage.setItem('username', result.user.username);
          console.log(sessionStorage.getItem('username'));
          window.location.reload();
          displayEmailInModal(formData.email);
          setIsOpen(false); // Only close on login
        }
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(errorText || 'Failed to process request.');
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      alert(error.message || 'Failed to connect to the server.');
    }
  };

  // Password strength function
  const passwordStrength = () => {
    const { password } = formData;
    if (password.length >= 8) return 'Strong';
    if (password.length >= 5) return 'Medium';
    return 'Weak';
  };

  // Display email in the modal if stored in sessionStorage
  const displayEmailInModal = (email: string) => {
    const storedEmail = sessionStorage.getItem('userEmail');
    if (storedEmail) {
      const emailElement = document.getElementById('loginEmail');
      if (emailElement) {
        emailElement.textContent = storedEmail;
      }
    }
  };

  // Use effect to check and display email if available in sessionStorage
  useEffect(() => {
    if (isOpen) {
      const storedEmail = sessionStorage.getItem('userEmail');
      if (storedEmail) {
        displayEmailInModal(storedEmail);
      }
    }
  }, [isOpen]);

  const displayUserDetails = () => {
    const storedEmail = sessionStorage.getItem('userEmail');
    const storedUserId = sessionStorage.getItem('userId');
    if (storedEmail && storedUserId) {
      const emailElement = document.getElementById('loginEmail');
      const userIdElement = document.getElementById('loginUserId');
      if (emailElement) {
        emailElement.textContent = storedEmail;
      }
      if (userIdElement) {
        userIdElement.textContent = storedUserId;
        console.log(userIdElement);
      }
    }
  };

  // Use effect to check and display email and user ID if available in sessionStorage
  useEffect(() => {
    if (isOpen) {
      displayUserDetails();
    }
  }, [isOpen]);
  
  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId'); 
    // Remove userId on logout
    setIsOpen(false); 
     // Close the modal on logout
    window.location.reload();
    alert('You have logged out successfully.');
    
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md shadow-lg w-96 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {isSignup ? 'Create an Account' : 'Login to Your Account'}
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Check if a user is logged in */}
        {sessionStorage.getItem('userEmail') ? (
          <div>
            <p>You are logged in as: <span id="loginEmail"></span></p>
            <p>User ID: <span id="loginUserId"></span></p>
            <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded-md mt-4">
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                  placeholder="Full Name"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                placeholder="Email Address"
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
                required
              />
              {formData.password && (
                <div className="text-sm text-gray-500">{passwordStrength()}</div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md"
            >
              {isSignup ? 'Sign Up' : 'Log In'}
            </button>

            <div className="text-center mt-4">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-blue-600 hover:underline"
              >
                {isSignup ? 'Already have an account? Log in' : 'Don’t have an account? Sign Up'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
