import React, { useState } from 'react';
import { type Experience, type DesignTeamReview } from '../../api/types';
import { updateExperience, updateDesignTeamReview } from '../../api/api';

interface AdminEditExperienceModalProps {
  item: Experience | DesignTeamReview;
  type: 'company' | 'dt';
  adminKey: string;
  onClose: () => void;
  onSuccess: (updated: any) => void;
  showFeedback: (message: string, type: 'success' | 'error') => void;
}

const AdminEditExperienceModal: React.FC<AdminEditExperienceModalProps> = ({
  item,
  type,
  adminKey,
  onClose,
  onSuccess,
  showFeedback,
}) => {
  // Common fields
  const [position, setPosition] = useState(item.position);
  const [term, setTerm] = useState(item.term);
  const [difficulty, setDifficulty] = useState(item.difficulty.toString());
  
  // Company-specific
  const [offerReceived, setOfferReceived] = useState(type === 'company' ? (item as Experience).offer_received : false);
  const [tips, setTips] = useState(item.tips || '');
  
  // DT-specific
  const [accepted, setAccepted] = useState(type === 'dt' ? (item as DesignTeamReview).accepted : false);
  const [description, setDescription] = useState(type === 'dt' ? (item as DesignTeamReview).description || '' : '');
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updated;
      if (type === 'company') {
        updated = await updateExperience(item.id, adminKey, {
          position,
          term,
          difficulty: parseInt(difficulty),
          offer_received: offerReceived,
          tips: tips,
        });
      } else {
        updated = await updateDesignTeamReview(item.id, adminKey, {
          position,
          term,
          difficulty: parseInt(difficulty),
          accepted: accepted,
          description: description,
          tips: tips,
        });
      }
      showFeedback('Experience updated successfully', 'success');
      onSuccess(updated);
      onClose();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to update experience', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-up max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-[#eee] dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#1a1a1a] z-10 font-playfair">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Edit {type === 'company' ? 'Experience' : 'DT Review'}.</h2>
            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#999]">ID: {item.id} • {item.submitter_email}</p>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#333] dark:hover:text-white transition-colors text-2xl font-sans font-normal">&times;</button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Position</label>
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full bg-[#f5f5f5] dark:bg-[#222] border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-maceng-maroon dark:focus:ring-maceng-orange transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Term</label>
              <input
                type="text"
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="w-full bg-[#f5f5f5] dark:bg-[#222] border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-maceng-maroon dark:focus:ring-maceng-orange transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Difficulty (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-[#f5f5f5] dark:bg-[#222] border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-maceng-maroon dark:focus:ring-maceng-orange transition-all dark:text-white"
              />
            </div>
            {type === 'company' ? (
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="offer_received"
                  checked={offerReceived}
                  onChange={e => setOfferReceived(e.target.checked)}
                  className="w-5 h-5 rounded border-[#ddd] dark:border-[#444] text-maceng-maroon dark:text-maceng-orange focus:ring-maceng-maroon dark:focus:ring-maceng-orange"
                />
                <label htmlFor="offer_received" className="text-sm font-bold dark:text-white">Offer Received</label>
              </div>
            ) : (
                <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="accepted"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="w-5 h-5 rounded border-[#ddd] dark:border-[#444] text-maceng-maroon dark:text-maceng-orange focus:ring-maceng-maroon dark:focus:ring-maceng-orange"
                />
                <label htmlFor="accepted" className="text-sm font-bold dark:text-white">Accepted</label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Tips / Interview Info</label>
            <textarea
              value={tips}
              onChange={e => setTips(e.target.value)}
              rows={3}
              className="w-full bg-[#f5f5f5] dark:bg-[#222] border-none rounded-xl px-4 py-4 font-bold text-sm focus:ring-2 focus:ring-maceng-maroon dark:focus:ring-maceng-orange transition-all dark:text-white"
            />
          </div>

          {type === 'dt' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Description / Review Content</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-[#f5f5f5] dark:bg-[#222] border-none rounded-xl px-4 py-4 font-bold text-sm focus:ring-2 focus:ring-maceng-maroon dark:focus:ring-maceng-orange transition-all dark:text-white"
              />
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-[#fcfcfc] dark:bg-[#151515] border-t border-[#eee] dark:border-[#333] flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold text-[#999] hover:bg-[#eee] dark:hover:bg-[#333] hover:text-[#333] dark:hover:text-white transition-all font-sans"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2 rounded-xl text-sm font-bold bg-maceng-maroon dark:bg-maceng-orange text-white shadow-lg shadow-maceng-maroon/20 dark:shadow-maceng-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 font-sans"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditExperienceModal;
