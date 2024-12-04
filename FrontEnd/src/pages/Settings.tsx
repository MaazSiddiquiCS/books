import React, { useState } from 'react';
import { User, Bell, Lock, Eye, EyeOff, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-6 w-6 mr-2 text-teal-500" />
          Profile Settings
        </h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="name" name="name" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" name="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="block w-full pr-10 border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="h-6 w-6 mr-2 text-teal-500" />
          Notification Settings
        </h2>
        <form className="space-y-4">
          <div className="flex items-center">
            <input id="email-notifications" name="email-notifications" type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">
              Receive email notifications
            </label>
          </div>
          <div className="flex items-center">
            <input id="push-notifications" name="push-notifications" type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-900">
              Receive push notifications
            </label>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Lock className="h-6 w-6 mr-2 text-teal-500" />
          Privacy Settings
        </h2>
        <form className="space-y-4">
          <div className="flex items-center">
            <input id="public-profile" name="public-profile" type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <label htmlFor="public-profile" className="ml-2 block text-sm text-gray-900">
              Make my profile public
            </label>
          </div>
          <div className="flex items-center">
            <input id="share-reading-activity" name="share-reading-activity" type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <label htmlFor="share-reading-activity" className="ml-2 block text-sm text-gray-900">
              Share my reading activity
            </label>
          </div>
        </form>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
          <Save className="h-5 w-5 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;