import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Music,
  Send,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  ListPlus,
} from 'lucide-react';

interface SongRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SongRequestModal: React.FC<SongRequestModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, songRequests, submitSongRequest } = useAuth();

  const [activeTab, setActiveTab] = useState<'submit' | 'my-requests'>('submit');
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [webLink, setWebLink] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const userRequests = songRequests.filter((r) =>
    currentUser ? r.requestedByUserId === currentUser.id : r.requestedByUsername === 'Guest Student'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) {
      setFeedback('Please enter the song title.');
      return;
    }

    setIsSubmitting(true);
    submitSongRequest({
      songTitle: songTitle.trim(),
      artist: artist.trim() || undefined,
      webLink: webLink.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    setSongTitle('');
    setArtist('');
    setWebLink('');
    setNotes('');
    setFeedback('Your song request has been sent to LiamDev12027! The admin will review it soon.');
    setActiveTab('my-requests');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl liquid-glass-surface rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md">
              <ListPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Request a Song
              </h3>
              <p className="text-xs text-slate-400">
                Ask LiamDev12027 to find and publish your favorite song to YouSong.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-6 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'submit'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Request
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-requests')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'my-requests'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>My Requests</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/[0.1] text-[10px] text-white">
              {userRequests.length}
            </span>
          </button>
        </div>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {activeTab === 'submit' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Song Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Clair de Lune, Moonlight Sonata, or Lo-Fi Coffee Beats"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Artist / Band / Composer (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Claude Debussy, Beethoven, Lofi Girl"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                Link to Song (YouTube, Spotify, Soundcloud, or MP3 URL - Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={webLink}
                onChange={(e) => setWebLink(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-[11px] transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Helps the admin find the exact version or piano arrangement you want.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Note for LiamDev12027 (Optional)
              </label>
              <textarea
                placeholder="Why do you want this song added? (e.g. Studying for AP Chemistry, quiet homework focus, etc.)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none transition-colors"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-[11px] text-slate-400">
                Submitting as:{' '}
                <strong className="text-cyan-300">{currentUser ? currentUser.username : 'Guest Student'}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {userRequests.length === 0 ? (
              <div className="py-12 text-center">
                <Music className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">You haven't requested any songs yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-200 text-xs font-medium border border-cyan-400/30 hover:bg-cyan-500/30 transition-colors"
                >
                  Request Your First Song
                </button>
              </div>
            ) : (
              userRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{req.songTitle}</h4>
                      {req.artist && <p className="text-[11px] text-slate-400">{req.artist}</p>}
                    </div>

                    <div>
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Added to Library!
                        </span>
                      )}
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                      {req.status === 'declined' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          Declined
                        </span>
                      )}
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-[11px] text-slate-400 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      "{req.notes}"
                    </p>
                  )}

                  {req.adminNote && (
                    <p className="text-[11px] text-cyan-300 bg-cyan-500/10 p-2 rounded-lg border border-cyan-400/20">
                      <strong>Admin LiamDev12027:</strong> {req.adminNote}
                    </p>
                  )}

                  <div className="text-[10px] text-slate-500">
                    Requested {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
