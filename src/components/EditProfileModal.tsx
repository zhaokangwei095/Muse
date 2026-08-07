import React, { useState } from 'react';
import { User } from '../types';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name,
      handle,
      bio,
      avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/60 dark:border-white/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 text-[#424754] dark:text-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <h3 className="font-headline text-2xl font-bold text-[#0b1c30] dark:text-white mb-6">
          Edit Profile
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#0058be] to-[#fc79bd] mb-3 relative overflow-hidden group">
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full border-2 border-white"
              />
            </div>
            <label className="text-xs text-[#0058be] font-medium cursor-pointer hover:underline">
              Change Image URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="ghost-input w-full text-xs text-center mt-1 py-1"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#424754] dark:text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#424754] dark:text-gray-300 mb-1">
              Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#424754] dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#424754] dark:text-gray-300 hover:bg-white/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
