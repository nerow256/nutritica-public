'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Send, Bot, User, ChevronDown, Trash2, Square, Sparkles, ImagePlus, X } from 'lucide-react';
import { isLoggedIn, getSessionUserId, dbGetUser, dbGetChatMessages, dbCreateChatMessage, dbClearChatMessages, type DbUser } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  image?: string;
}

interface ChatModel {
  name: string;
  size: number;
  provider: 'ollama' | 'gemini';
}

const quickPrompts = [
  { key: 'promptBreakfast' as const, icon: '🌅' },
  { key: 'promptCalories' as const, icon: '🔢' },
  { key: 'promptLowCarb' as const, icon: '🥗' },
  { key: 'promptHeart' as const, icon: '❤️' },
];

function formatSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
}

function renderMarkdown(text: string) {
  // Simple markdown: bold, italic, code, headers, lists
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    let processed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');

    if (processed.startsWith('### ')) {
      processed = `<h3>${processed.slice(4)}</h3>`;
    } else if (processed.startsWith('## ')) {
      processed = `<h2>${processed.slice(3)}</h2>`;
    } else if (processed.startsWith('# ')) {
      processed = `<h1>${processed.slice(2)}</h1>`;
    } else if (/^[-*]\s/.test(processed)) {
      if (!inList) { result.push('<ul>'); inList = true; }
      processed = `<li>${processed.slice(2)}</li>`;
    } else if (/^\d+\.\s/.test(processed)) {
      if (!inList) { result.push('<ol>'); inList = true; }
      processed = `<li>${processed.replace(/^\d+\.\s/, '')}</li>`;
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      if (processed.trim()) processed = `<p>${processed}</p>`;
    }
    result.push(processed);
  }
  if (inList) result.push('</ul>');
  return result.join('');
}

export default function ChatbotPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<DbUser | null>(null);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('gemma3:4b');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = getSessionUserId();

  useEffect(() => {
    if (!isLoggedIn() || !userId) { router.push('/login'); return; }

    (async () => {
      try {
        const u = await dbGetUser(userId);
        setUser(u);
        const history = await dbGetChatMessages(userId);
        if (history.length === 0) {
          const welcome: Message = {
            id: 'welcome',
            role: 'assistant',
            content: t.welcomeMessage,
            timestamp: new Date().toISOString(),
          };
          setMessages([welcome]);
          await dbCreateChatMessage({ role: 'assistant', content: welcome.content, timestamp: welcome.timestamp, userId });
        } else {
          setMessages(history.map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, timestamp: m.timestamp })));
        }
      } catch {}
    })();

    const savedModel = localStorage.getItem('dhc_selected_model');
    if (savedModel) setSelectedModel(savedModel);

    fetch('/api/chat')
      .then(res => res.json())
      .then(data => {
        if (data.models?.length > 0) {
          setModels(data.models);
          setAiOnline(true);
          if (!savedModel) {
            const preferred = data.models.find((m: ChatModel) => m.name === 'gemma3:4b');
            setSelectedModel(preferred ? preferred.name : data.models[0].name);
          }
        }
      })
      .catch(() => setAiOnline(false));
  }, [router, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsTyping(false);
    }
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      // Resize to max 1024px on longest side — balances quality and speed
      const MAX = 1024;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(compressed);
      setImageBase64(compressed.split(',')[1]);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }, []);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageBase64(null);
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim();
    if ((!content && !imageBase64) || isTyping || !user || !userId) return;

    const finalContent = content || t.analyzeImage;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: finalContent, timestamp: new Date().toISOString(), image: imagePreview || undefined };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    const sentImageBase64 = imageBase64;
    clearImage();
    setIsTyping(true);

    await dbCreateChatMessage({ role: 'user', content: finalContent, timestamp: userMsg.timestamp, userId });

    const systemPrompt = `You are a helpful diet and health companion AI assistant. The user's name is ${user.name}. Their profile: weight ${user.weight}kg, height ${user.height}cm, age ${user.age}, goal: ${user.goal} weight. ${user.healthConditions.length > 0 ? `Health conditions: ${user.healthConditions.join(', ')}.` : ''} ${user.dietaryRestrictions.length > 0 ? `Dietary restrictions: ${user.dietaryRestrictions.join(', ')}.` : ''} Give concise, practical nutrition and health advice. Use markdown formatting for lists and emphasis.`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...updated.filter(m => m.role === 'user' || m.role === 'assistant').slice(-10).map(m => ({ role: m.role, content: m.content })),
    ];

    const botMsgId = `b-${Date.now()}`;
    const botMsg: Message = { id: botMsgId, role: 'assistant', content: '', timestamp: new Date().toISOString() };

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, model: selectedModel, ...(sentImageBase64 ? { images: [sentImageBase64] } : {}) }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        botMsg.content = `${t.chatErrorConnect} ${err.error || ''}`;
        setMessages([...updated, botMsg]);
        dbCreateChatMessage({ role: 'assistant', content: botMsg.content, timestamp: botMsg.timestamp, userId });
        setIsTyping(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let accumulated = '';
      setMessages([...updated, botMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.thinking && !accumulated) {
                botMsg.content = '🤔 *Thinking...*';
                setMessages(prev => {
                  const copy = [...prev];
                  const idx = copy.findIndex(m => m.id === botMsgId);
                  if (idx >= 0) copy[idx] = { ...botMsg };
                  return copy;
                });
              } else if (parsed.content) {
                accumulated += parsed.content;
                botMsg.content = accumulated;
                setMessages(prev => {
                  const copy = [...prev];
                  const idx = copy.findIndex(m => m.id === botMsgId);
                  if (idx >= 0) copy[idx] = { ...botMsg };
                  return copy;
                });
              }
            } catch {}
          }
        }
      }

      botMsg.content = accumulated || t.chatErrorEmpty;
      setMessages([...updated, botMsg]);
      dbCreateChatMessage({ role: 'assistant', content: botMsg.content, timestamp: botMsg.timestamp, userId });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        if (botMsg.content) {
          botMsg.content += `\n\n*(${t.generationStopped})*`;
          setMessages([...updated, botMsg]);
          dbCreateChatMessage({ role: 'assistant', content: botMsg.content, timestamp: botMsg.timestamp, userId });
        }
      } else {
        botMsg.content = t.chatErrorGeneral;
        setMessages([...updated, botMsg]);
        dbCreateChatMessage({ role: 'assistant', content: botMsg.content, timestamp: botMsg.timestamp, userId });
      }
    } finally {
      setIsTyping(false);
      abortRef.current = null;
    }
  }, [input, isTyping, messages, user, userId, selectedModel, imageBase64, imagePreview, clearImage, t.analyzeImage]);

  const clearChat = async () => {
    if (!userId) return;
    await dbClearChatMessages(userId);
    const welcome: Message = { id: 'welcome', role: 'assistant', content: t.chatCleared, timestamp: new Date().toISOString() };
    setMessages([welcome]);
    await dbCreateChatMessage({ role: 'assistant', content: welcome.content, timestamp: welcome.timestamp, userId });
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setShowModelPicker(false);
    localStorage.setItem('dhc_selected_model', model);
  };

  const showQuickPrompts = messages.length <= 1;

  return (
    <div className="h-screen m3-surface flex flex-col desktop-offset">
      {/* Header */}
      <div className="m3-glass border-b border-[var(--m3-outline-variant)] px-4 py-3 flex-shrink-0 z-10">
        <div className="flex items-center justify-between lg:max-w-4xl lg:mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 m3-gradient-header rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="m3-title-medium m3-on-surface">{t.aiHealthCompanion}</h1>
              <button onClick={() => aiOnline && setShowModelPicker(!showModelPicker)} className="flex items-center gap-1 m3-label-small m3-primary-text">
                {aiOnline ? (
                  <><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{selectedModel || t.selectModel}<ChevronDown size={12} /></>
                ) : (
                  <><span className="w-1.5 h-1.5 bg-red-500 rounded-full" />{t.aiOffline || t.ollamaOffline}</>
                )}
              </button>
            </div>
          </div>
          <button onClick={clearChat} className="p-2.5 rounded-full hover:bg-[var(--m3-on-surface)]/[0.08] active:bg-[var(--m3-on-surface)]/[0.12] transition-colors">
            <Trash2 size={18} className="m3-on-surface-variant" />
          </button>
        </div>
        {showModelPicker && (
          <div className="mt-2 m3-card-elevated rounded-2xl p-2 absolute left-4 right-4 z-50 max-w-lg mx-auto">
            {models.map(m => (
              <button key={m.name} onClick={() => handleModelChange(m.name)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${selectedModel === m.name ? 'bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]' : 'hover:bg-[var(--m3-on-surface)]/[0.08] m3-on-surface'}`}>
                <div className="flex items-center gap-2">
                  <span className="m3-body-large">{m.name.replace('gemini:', '')}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${m.provider === 'gemini' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                    {m.provider === 'gemini' ? 'Cloud' : 'Local'}
                  </span>
                </div>
                <span className="m3-label-small m3-on-surface-variant">{m.size ? formatSize(m.size) : ''}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-40 no-scrollbar lg:max-w-4xl lg:mx-auto lg:w-full">
        {showQuickPrompts && (
          <div className="mb-6 m3-animate-enter">
            <div className="text-center mb-5">
              <div className="w-16 h-16 mx-auto mb-3 m3-gradient-header rounded-[20px] flex items-center justify-center m3-elevation-2">
                <Sparkles size={28} className="text-white" />
              </div>
              <p className="m3-title-medium m3-on-surface">{t.howCanIHelp}</p>
              <p className="m3-body-medium m3-on-surface-variant mt-1">{t.askAnything}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {quickPrompts.map((prompt) => (
                <button key={prompt.key} onClick={() => sendMessage(t[prompt.key])}
                  className="text-left p-3.5 m3-card-outlined rounded-2xl m3-state-layer transition-all active:scale-[0.97]">
                  <span className="text-lg mb-1.5 block">{prompt.icon}</span>
                  <span className="m3-body-medium m3-on-surface-variant leading-snug">{t[prompt.key]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} m3-animate-enter`}>
            <div className={`flex gap-2.5 max-w-[85%] lg:max-w-[65%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-[var(--m3-primary)]'
                  : 'm3-surface-container-high'
              }`}>
                {msg.role === 'user'
                  ? <User size={15} className="text-[var(--m3-on-primary)]" />
                  : <Bot size={15} className="m3-primary-text" />
                }
              </div>
              <div className={`p-3.5 m3-body-medium ${
                msg.role === 'user'
                  ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] rounded-[20px] rounded-tr-md'
                  : 'm3-surface-container-low m3-on-surface rounded-[20px] rounded-tl-md m3-elevation-1'
              }`}>
                {msg.image && (
                  <img src={msg.image} alt="" className="rounded-xl max-w-[200px] max-h-[200px] object-cover mb-2" />
                )}
                {msg.role === 'assistant' ? (
                  <div className="chat-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-2.5 m3-animate-enter">
            <div className="w-8 h-8 rounded-full m3-surface-container-high flex items-center justify-center">
              <Bot size={15} className="m3-primary-text" />
            </div>
            <div className="m3-surface-container-low p-4 rounded-[20px] rounded-tl-md m3-elevation-1">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[var(--m3-outline)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--m3-outline)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--m3-outline)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="chat-input-bar fixed bottom-20 left-0 right-0 m3-glass border-t border-[var(--m3-outline-variant)] px-4 py-3 z-40">
        <div className="max-w-lg lg:max-w-4xl mx-auto">
          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <img src={imagePreview} alt="" className="h-16 w-16 object-cover rounded-xl border border-[var(--m3-outline-variant)]" />
              <button onClick={clearImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--m3-error)] text-[var(--m3-on-error)] rounded-full flex items-center justify-center">
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={!aiOnline}
              className="p-2.5 rounded-full hover:bg-[var(--m3-on-surface)]/[0.08] active:bg-[var(--m3-on-surface)]/[0.12] transition-colors flex-shrink-0 disabled:opacity-40"
              title={t.attachImage}>
              <ImagePlus size={20} className={imageBase64 ? 'text-[var(--m3-primary)]' : 'm3-on-surface-variant'} />
            </button>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={aiOnline ? t.typeQuestion : (t.aiOffline || t.ollamaOffline) + '...'}
              disabled={!aiOnline}
              className="m3-input !rounded-full !py-3" />
            {isTyping ? (
              <button onClick={stopGeneration} className="m3-fab-small !rounded-full flex-shrink-0 !bg-[var(--m3-error)] !text-[var(--m3-on-error)]">
                <Square size={16} />
              </button>
            ) : (
              <button onClick={() => sendMessage()} disabled={!aiOnline || (!input.trim() && !imageBase64)} className="m3-fab-small !rounded-full flex-shrink-0 disabled:opacity-40">
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
