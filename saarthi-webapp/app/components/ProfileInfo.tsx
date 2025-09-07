'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUserProfile } from '../services/apiService';

interface ProfileInfoProps {
  user: {
    name?: string;
    phoneNumber: string;
    _id?: string;
  };
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const handleSaveName = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length > 30) {
      toast.error('Name cannot exceed 30 characters.');
      return;
    }
    if (!user._id) {
      toast.error('User ID not found.');
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile(user._id, trimmedName);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.name = trimmedName;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      setName(trimmedName);
      setIsEditingName(false);
      toast.success('Name updated successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast.error(`Failed to update name: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-gray-800 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center space-y-4">
        {isEditingName ? (
          <div className="w-full space-y-3">
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={loading}
              placeholder="Enter your name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveName();
                } else if (e.key === 'Escape') {
                  setIsEditingName(false);
                  setName(user.name || '');
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSaveName}
                disabled={loading}
                className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition duration-200"
                aria-label="Save name"
              >
                <Check className="h-5 w-5" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setName(user.name || '');
                }}
                disabled={loading}
                className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition duration-200"
                aria-label="Cancel editing"
              >
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 w-full">
            <div className="flex items-center justify-center w-full">
              <span className="text-2xl font-semibold">{name || 'Shekhar'}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition duration-200"
                aria-label="Edit name"
              >
                <Edit className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <span className="text-gray-600 text-lg">{user?.phoneNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;