import React, { useState } from 'react';
import { type Company } from '../../api/types';
import { updateCompany } from '../../api/api';

interface AdminEditCompanyModalProps {
  company: Company;
  adminKey: string;
  onClose: () => void;
  onSuccess: (updated: Company) => void;
  showFeedback: (message: string, type: 'success' | 'error') => void;
}

const AdminEditCompanyModal: React.FC<AdminEditCompanyModalProps> = ({
  company,
  adminKey,
  onClose,
  onSuccess,
  showFeedback,
}) => {
  const [name, setName] = useState(company.name);
  const [industries, setIndustries] = useState(company.industries.join(', '));
  const [rating, setRating] = useState(company.rating?.toString() || '0');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateCompany(company.id, adminKey, {
        name,
        industries: industries.split(',').map(s => s.trim()).filter(Boolean),
        rating: parseFloat(rating),
      });
      showFeedback('Company updated successfully', 'success');
      onSuccess(updated);
      onClose();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to update company', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-[#eee] dark:border-[#333] flex justify-between items-center">
          <div>
            <h2 className="font-playfair text-xl font-bold dark:text-white">Edit Company.</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#999]">ID: {company.id}</p>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#333] dark:hover:text-white transition-colors text-2xl">&times;</button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Company Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#f5f5f5] dark:bg-[#222] border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-maceng-maroon dark:focus:ring-maceng-orange transition-all dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Industries (comma separated)</label>
            <input
              type="text"
              value={industries}
              onChange={e => setIndustries(e.target.value)}
              className="w-full bg-[#f5f5f5] dark:bg-[#222] border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-maceng-maroon dark:focus:ring-maceng-orange transition-all dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Rating (0-5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={rating}
              onChange={e => setRating(e.target.value)}
              className="w-full bg-[#f5f5f5] dark:bg-[#222] border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-maceng-maroon dark:focus:ring-maceng-orange transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="px-8 py-6 bg-[#fcfcfc] dark:bg-[#151515] border-t border-[#eee] dark:border-[#333] flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold text-[#999] hover:bg-[#eee] dark:hover:bg-[#333] hover:text-[#333] dark:hover:text-white transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2 rounded-xl text-sm font-bold bg-maceng-maroon dark:bg-maceng-orange text-white shadow-lg shadow-maceng-maroon/20 dark:shadow-maceng-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditCompanyModal;
