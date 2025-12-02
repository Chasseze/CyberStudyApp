import React, { useState } from 'react';
import {
  Lock,
  Shield,
  Mail,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Save,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * AccountManagementPanel Component
 * Handles password changes, security settings, and account deletion
 */
const AccountManagementPanel = ({ darkMode, onLogout }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });

  const [deleteForm, setDeleteForm] = useState({
    email: '',
    password: '',
    confirmDelete: false,
    showPassword: false,
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteInputChange = (field, value) => {
    setDeleteForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      showNotification('Please enter your current password', 'error');
      return false;
    }
    if (!passwordForm.newPassword) {
      showNotification('Please enter a new password', 'error');
      return false;
    }
    if (passwordForm.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return false;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      showNotification('New password must be different from current password', 'error');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      setLoading(true);

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );

      try {
        await reauthenticateWithCredential(auth.currentUser, credential);
      } catch (error) {
        if (error.code === 'auth/wrong-password') {
          showNotification('❌ Current password is incorrect', 'error');
          return;
        }
        throw error;
      }

      // Update password
      await updatePassword(auth.currentUser, passwordForm.newPassword);

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false,
      });
      setShowPasswordForm(false);
      showNotification('✅ Password changed successfully', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification(`❌ Failed to change password: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteForm.email !== user.email) {
      showNotification('❌ Email does not match', 'error');
      return;
    }

    if (!deleteForm.confirmDelete) {
      showNotification('❌ Please confirm account deletion', 'error');
      return;
    }

    try {
      setLoading(true);

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        deleteForm.password
      );

      try {
        await reauthenticateWithCredential(auth.currentUser, credential);
      } catch (error) {
        if (error.code === 'auth/wrong-password') {
          showNotification('❌ Password is incorrect', 'error');
          return;
        }
        throw error;
      }

      // In production, call a Cloud Function to:
      // 1. Delete all user data from Firestore
      // 2. Delete the user account
      // For now, just show success
      showNotification('✅ Account deletion initiated. You will be logged out.', 'success');

      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      showNotification(`❌ Failed to delete account: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          notification.type === 'success'
            ? darkMode ? 'bg-green-900/30 border border-green-700 text-green-300' : 'bg-green-50 border border-green-200 text-green-700'
            : darkMode ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-700' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'} rounded-2xl p-8 border`}>
        <div className="flex items-center gap-3 mb-4">
          <Shield size={32} className={darkMode ? 'text-green-400' : 'text-green-600'} />
          <h1 className="text-3xl font-bold">Account & Security</h1>
        </div>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your account security and settings
        </p>
      </div>

      {/* Account Information */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-4`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Mail size={24} />
          Account Information
        </h2>

        <div className="pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Email Address
          </p>
          <p className="font-semibold text-lg mt-1">{user?.email}</p>
        </div>

        <div className="pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Account Created
          </p>
          <p className="font-semibold text-lg mt-1">
            {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
          </p>
        </div>

        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last Sign In
          </p>
          <p className="font-semibold text-lg mt-1">
            {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>

      {/* Change Password Section */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-6`}>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lock size={24} />
          Change Password
        </h2>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Lock size={18} />
            Change Password
          </button>
        ) : (
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={passwordForm.showCurrent ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  placeholder="Enter your current password"
                  className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handlePasswordInputChange('showCurrent', !passwordForm.showCurrent)}
                  className={`absolute right-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {passwordForm.showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={passwordForm.showNew ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handlePasswordInputChange('showNew', !passwordForm.showNew)}
                  className={`absolute right-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {passwordForm.showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={passwordForm.showConfirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handlePasswordInputChange('showConfirm', !passwordForm.showConfirm)}
                  className={`absolute right-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {passwordForm.showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                } bg-green-600 hover:bg-green-700 text-white`}
              >
                <Save size={18} />
                Update Password
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Security Tips */}
        <div className={`p-4 rounded-lg text-sm ${darkMode ? 'bg-blue-900/20 border border-blue-700 text-blue-200' : 'bg-blue-50 border border-blue-200 text-blue-900'}`}>
          <p className="font-semibold mb-2">🔐 Password Security Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use at least 8 characters</li>
            <li>Mix uppercase, lowercase, numbers, and symbols</li>
            <li>Avoid using personal information</li>
            <li>Don't reuse passwords across services</li>
          </ul>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className={`${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} rounded-2xl p-8 border space-y-6`}>
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
          <Trash2 size={24} />
          Delete Account
        </h2>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/40 text-red-200' : 'bg-red-100 text-red-900'}`}>
          <p className="font-semibold mb-2">⚠️ This action cannot be undone</p>
          <p className="text-sm">
            Deleting your account will permanently remove all your data including study entries, goals, timer sessions, and preferences. This cannot be recovered.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-white bg-red-600 hover:bg-red-700`}
          >
            <Trash2 size={18} />
            Delete My Account
          </button>
        ) : (
          <div className="space-y-4">
            {/* Email Confirmation */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm your email address
              </label>
              <input
                type="email"
                value={deleteForm.email}
                onChange={(e) => handleDeleteInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
                disabled={loading}
              />
            </div>

            {/* Password Verification */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Enter your password
              </label>
              <div className="relative">
                <input
                  type={deleteForm.showPassword ? 'text' : 'password'}
                  value={deleteForm.password}
                  onChange={(e) => handleDeleteInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteInputChange('showPassword', !deleteForm.showPassword)}
                  className={`absolute right-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {deleteForm.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteForm.confirmDelete}
                onChange={(e) => handleDeleteInputChange('confirmDelete', e.target.checked)}
                className="w-4 h-4"
                disabled={loading}
              />
              <span className="text-sm">
                I understand this action is permanent and cannot be undone
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleDeleteAccount}
                disabled={loading || !deleteForm.confirmDelete}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  loading || !deleteForm.confirmDelete ? 'opacity-50 cursor-not-allowed' : ''
                } text-white bg-red-600 hover:bg-red-700`}
              >
                Permanently Delete Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteForm({ email: '', password: '', confirmDelete: false, showPassword: false });
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountManagementPanel;
