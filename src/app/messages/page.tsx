'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, ArrowLeft, Stethoscope, ShieldCheck, Copy, RefreshCw, ImagePlus, X } from 'lucide-react';
import { isLoggedIn, getSessionUserId } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';
import BottomNav from '@/components/BottomNav';

interface Conversation {
  userId: string;
  name: string;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Access code state (for patients)
  const [providerCode, setProviderCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Chat state
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    const id = getSessionUserId();
    setUserId(id);
    setUserRole(localStorage.getItem('dhc_user_role'));
    if (id) loadConversations(id);
  }, [router]);

  const loadConversations = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-conversations', userId: uid }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (res.ok) setConversations(data.conversations || []);
    } catch { /* */ } finally { setLoading(false); }
  };

  const loadMessages = useCallback(async (otherUserId: string) => {
    if (!userId) return;
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-messages', userId, otherUserId }),
      });
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch { /* */ }
  }, [userId]);

  const markRead = useCallback(async (senderId: string) => {
    if (!userId) return;
    try {
      await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', userId, senderId }),
      });
    } catch { /* */ }
  }, [userId]);

  const closeChat = useCallback(() => {
    setActiveChat(null);
    setImagePreview(null);
    if (pollRef.current) clearInterval(pollRef.current);
    if (userId) loadConversations(userId);
  }, [userId]);

  const openChat = (conv: { userId: string; name: string }) => {
    setActiveChat({ id: conv.userId, name: conv.name });
    loadMessages(conv.userId);
    markRead(conv.userId);
    // Clear unread count locally
    setConversations(prev => prev.map(c => c.userId === conv.userId ? { ...c, unreadCount: 0 } : c));
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      loadMessages(conv.userId);
      markRead(conv.userId);
    }, 5000);
    // Push history so browser back goes to conversation list
    window.history.pushState({ chat: true }, '', undefined);
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      closeChat();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [closeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit

    const reader = new FileReader();
    reader.onload = () => {
      // Compress image before sending
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1200;
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setImagePreview(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so the same file can be selected again
    e.target.value = '';
  };

  const sendMessage = async () => {
    if (!userId || !activeChat || (!msgInput.trim() && !imagePreview)) return;
    setMsgSending(true);
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          senderId: userId,
          receiverId: activeChat.id,
          content: msgInput.trim(),
          imageUrl: imagePreview || '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setMsgInput('');
        setImagePreview(null);
      }
    } catch { /* */ } finally { setMsgSending(false); }
  };

  const generateCode = async () => {
    if (!userId) return;
    setCodeLoading(true);
    try {
      const res = await fetch('/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', userId }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (res.ok) setProviderCode(data.code);
      else alert(data.error || 'Failed to generate code');
    } catch { alert('Network error. Please try again.'); } finally { setCodeLoading(false); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(providerCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return t.yesterday || 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString(locale, { weekday: 'short' });
    return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  // ═══ FULLSCREEN IMAGE VIEWER ═══
  if (expandedImage) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setExpandedImage(null)}>
        <button onClick={() => setExpandedImage(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white">
          <X size={24} />
        </button>
        <img src={expandedImage} alt="Full size" className="max-w-full max-h-full object-contain" />
      </div>
    );
  }

  // ═══ CHAT VIEW ═══
  if (activeChat) {
    return (
      <div className="h-screen m3-surface flex flex-col desktop-offset">
        <div className="m3-gradient-header text-white px-4 pt-4 pb-3 flex items-center gap-3 flex-shrink-0 lg:rounded-b-none">
          <button onClick={() => { closeChat(); window.history.back(); }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Stethoscope size={18} />
          </div>
          <div>
            <p className="m3-title-medium font-bold">{activeChat.name}</p>
            <p className="m3-label-small opacity-70">{t.doctor || 'Doctor'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle size={40} className="text-[var(--m3-on-surface-variant)] mx-auto mb-3 opacity-30" />
              <p className="m3-body-medium text-[var(--m3-on-surface-variant)]">{t.noMessagesYet || 'No messages yet'}</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === userId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] rounded-br-md'
                    : 'bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)] rounded-bl-md'
                }`}>
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Shared image"
                      className="rounded-xl mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ maxHeight: 240 }}
                      onClick={() => setExpandedImage(msg.imageUrl || null)}
                    />
                  )}
                  {msg.content && <p className="m3-body-medium whitespace-pre-wrap">{msg.content}</p>}
                  <p className={`m3-label-small mt-1 ${isMe ? 'opacity-70' : 'text-[var(--m3-on-surface-variant)]'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 pt-2">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-xl border m3-border" />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--m3-error)] text-[var(--m3-on-error)] rounded-full flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-t m3-border bg-[var(--m3-surface)] mb-20 lg:mb-0 flex-shrink-0">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-full bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform hover:bg-[var(--m3-surface-container-highest)]"
            >
              <ImagePlus size={20} />
            </button>
            <textarea
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={t.typeMessage || 'Type a message...'}
              className="m3-input flex-1 min-h-[44px] max-h-[120px] resize-none py-2.5"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={msgSending || (!msgInput.trim() && !imagePreview)}
              className="w-11 h-11 rounded-full bg-[var(--m3-primary)] text-[var(--m3-on-primary)] flex items-center justify-center disabled:opacity-40 flex-shrink-0 active:scale-95 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ═══ CONVERSATIONS LIST ═══
  return (
    <div className="min-h-screen m3-surface pb-20 desktop-offset">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="lg:max-w-5xl lg:mx-auto">
          <h1 className="m3-title-large">{t.messagesTitle || 'Messages'}</h1>
          <p className="m3-label-small opacity-80">{t.messagesSubtitle || 'Chat with your healthcare providers'}</p>
        </div>
      </div>

      <div className="px-5 py-4 max-w-2xl mx-auto space-y-4">

        {/* Access code card — only for patients */}
        {userRole !== 'doctor' && (
          <div className="m3-card-elevated rounded-[20px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-[var(--m3-primary)]" />
              <h3 className="m3-title-medium text-[var(--m3-on-surface)]">{t.shareWithProvider || 'Share with Doctor'}</h3>
            </div>
            <p className="m3-body-small text-[var(--m3-on-surface-variant)] mb-3">
              {t.shareWithProviderDesc || 'Generate a code so your doctor can access your data and message you'}
            </p>
            {providerCode ? (
              <div className="text-center">
                <p className="text-2xl font-mono font-bold tracking-[0.3em] text-[var(--m3-primary)] mb-1">{providerCode}</p>
                <p className="m3-label-small text-[var(--m3-on-surface-variant)] mb-3">{t.codeExpires24h || 'Expires in 24 hours'}</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={copyCode} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--m3-primary)] text-[var(--m3-on-primary)] m3-label-medium">
                    <Copy size={14} /> {codeCopied ? (t.codeCopied || 'Copied!') : (t.copyCode || 'Copy')}
                  </button>
                  <button onClick={generateCode} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)] m3-label-medium">
                    <RefreshCw size={14} /> {t.generateNew || 'New Code'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={generateCode}
                disabled={codeLoading}
                className="w-full py-3 rounded-full bg-[var(--m3-primary)] text-[var(--m3-on-primary)] m3-label-large font-bold disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {codeLoading ? (t.loading || 'Loading...') : (t.generateAccessCode || 'Generate Access Code')}
              </button>
            )}
          </div>
        )}

        {/* Conversations */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[var(--m3-primary)] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="text-[var(--m3-on-surface-variant)] mx-auto mb-4 opacity-30" />
            <p className="m3-title-medium text-[var(--m3-on-surface)]">{t.noConversations || 'No messages yet'}</p>
            <p className="m3-body-medium text-[var(--m3-on-surface-variant)] mt-2 max-w-xs mx-auto">
              {t.noConversationsDesc || 'When your healthcare provider sends you a message, it will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.userId}
                onClick={() => openChat(conv)}
                className="w-full m3-card rounded-[16px] p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--m3-primary-container)] flex items-center justify-center flex-shrink-0">
                  <Stethoscope size={20} className="text-[var(--m3-on-primary-container)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="m3-body-large text-[var(--m3-on-surface)] font-medium truncate">{conv.name}</p>
                    {conv.lastMessageAt && (
                      <span className="m3-label-small text-[var(--m3-on-surface-variant)] flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                    )}
                  </div>
                  <p className="m3-body-small text-[var(--m3-on-surface-variant)] truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[var(--m3-primary)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[var(--m3-on-primary)]">{conv.unreadCount}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
