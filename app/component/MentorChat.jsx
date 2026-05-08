'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import {
  FaPaperPlane, FaPlus, FaSearch, FaTrash, FaPenAlt,
  FaRobot, FaUser, FaRoad, FaMoneyBillWave, FaExclamationTriangle,
  FaSpinner, FaArrowLeft, FaBars, FaTimes, FaCheck, FaCopy
} from 'react-icons/fa';

const authHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const STARTER_PROMPTS = [
  "How do I get my first sale on Daraz?",
  "What products should I sell with PKR 10,000?",
  "How to write a product title that converts?",
  "Should I do COD or pre-payment for new customers?",
];

export default function MentorChat() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState([]); // current conversation messages
  const [contextSnapshot, setContextSnapshot] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [renaming, setRenaming] = useState(null); // id being renamed
  const [renameValue, setRenameValue] = useState('');

  const threadEndRef = useRef(null);

  // Auto-scroll thread to bottom whenever it changes.
  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [thread.length, sending]);

  const fetchList = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get(`${API}/api/mentor-conversations`, {
        withCredentials: true, headers: authHeader(),
      });
      setConversations(res.data?.conversations || []);
    } catch (err) {
      if (err.response?.status === 401) { router.push('/login'); return; }
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const openConversation = async (id) => {
    if (!id) return;
    try {
      setLoadingThread(true);
      setError('');
      const res = await axios.get(`${API}/api/mentor-conversations/${id}`, {
        withCredentials: true, headers: authHeader(),
      });
      const c = res.data?.conversation;
      if (!c) return;
      setActiveId(c._id);
      setThread(c.messages || []);
      setContextSnapshot(c.contextSnapshot || null);
      setSidebarOpen(false);
    } catch (err) {
      console.error(err);
      setError('Could not load that conversation.');
    } finally {
      setLoadingThread(false);
    }
  };

  const startNew = () => {
    setActiveId(null);
    setThread([]);
    setContextSnapshot(null);
    setError('');
    setSidebarOpen(false);
  };

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? draft).trim();
    if (!text || sending) return;

    setSending(true);
    setError('');

    // Optimistic — add user message right away so it feels instant
    const userMsg = { role: 'user', content: text, _local: true };
    setThread((t) => [...t, userMsg]);
    setDraft('');

    try {
      const res = await axios.post(
        `${API}/api/mentor-chat`,
        { message: text, conversationId: activeId },
        { withCredentials: true, headers: { 'Content-Type': 'application/json', ...authHeader() } }
      );
      const data = res.data;
      const newId = data.conversationId;
      const reply = data.reply || '';

      // Append assistant reply
      setThread((t) => [...t.filter((m) => !m._local), ...(data.messages || [
        { role: 'user', content: text },
        { role: 'assistant', content: reply },
      ])]);

      // If this was a new conversation, set active id and refresh sidebar
      if (!activeId && newId) {
        setActiveId(newId);
        await fetchList();
      } else {
        // bump lastMessageAt locally so the sidebar order updates without a full re-fetch
        setConversations((cs) => {
          const idx = cs.findIndex((c) => String(c._id) === String(newId));
          if (idx === -1) return cs;
          const updated = { ...cs[idx], lastMessageAt: new Date().toISOString(), messageCount: (cs[idx].messageCount || 0) + 2 };
          return [updated, ...cs.filter((_, i) => i !== idx)];
        });
      }
    } catch (err) {
      console.error(err);
      // Roll back optimistic message
      setThread((t) => t.filter((m) => !m._local));
      setError(err.response?.data?.error || 'Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/api/mentor-conversations/${id}`, {
        withCredentials: true, headers: authHeader(),
      });
      setConversations((cs) => cs.filter((c) => String(c._id) !== String(id)));
      if (activeId === id) startNew();
    } catch {
      alert('Failed to delete.');
    }
  };

  const handleRename = async (id) => {
    const newTitle = renameValue.trim();
    if (!newTitle) { setRenaming(null); return; }
    try {
      const res = await axios.patch(`${API}/api/mentor-conversations/${id}`, { title: newTitle }, {
        withCredentials: true, headers: { 'Content-Type': 'application/json', ...authHeader() },
      });
      const updated = res.data?.conversation;
      setConversations((cs) =>
        cs.map((c) => String(c._id) === String(id) ? { ...c, title: updated?.title || newTitle } : c)
      );
    } catch {
      alert('Failed to rename.');
    } finally {
      setRenaming(null);
      setRenameValue('');
    }
  };

  const filteredConvos = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (c.title || '').toLowerCase().includes(q) ||
           (c.preview?.content || '').toLowerCase().includes(q);
  });

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] max-h-[900px] flex bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 fixed sm:static z-30 inset-y-0 left-0 w-72 bg-white border-r border-slate-100 flex flex-col transition-transform`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-600/30 shrink-0">
              <FaRobot className="text-white text-sm" />
            </div>
            <p className="font-extrabold text-slate-900 text-sm">AI Mentor</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="sm:hidden text-slate-500 hover:text-slate-800 p-1"
            title="Close"
          ><FaTimes size={14} /></button>
        </div>

        <div className="p-3">
          <button
            onClick={startNew}
            className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-teal-600/20 transition"
          >
            <FaPlus size={11} /> New chat
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {loadingList ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredConvos.length === 0 ? (
            <p className="text-xs text-slate-400 px-3 py-6 text-center">
              {search ? 'No chats match' : 'No chats yet. Click + to start.'}
            </p>
          ) : (
            <ul className="space-y-1">
              {filteredConvos.map((c) => {
                const isActive = String(c._id) === String(activeId);
                const isRenaming = renaming === c._id;
                return (
                  <li key={c._id}>
                    <div
                      onClick={() => !isRenaming && openConversation(c._id)}
                      className={`group p-2.5 rounded-lg cursor-pointer transition border ${
                        isActive
                          ? 'bg-teal-50 border-teal-200'
                          : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs shrink-0">
                          <FaRobot size={11} />
                        </div>
                        <div className="min-w-0 flex-1">
                          {isRenaming ? (
                            <input
                              autoFocus
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(c._id);
                                if (e.key === 'Escape') { setRenaming(null); setRenameValue(''); }
                              }}
                              onBlur={() => handleRename(c._id)}
                              className="w-full text-xs font-semibold text-slate-900 bg-white border border-teal-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-teal-500/30"
                            />
                          ) : (
                            <p className={`text-xs font-semibold truncate ${isActive ? 'text-teal-800' : 'text-slate-800'}`}>
                              {c.title}
                            </p>
                          )}
                          {c.preview?.content && !isRenaming && (
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{c.preview.content}</p>
                          )}
                        </div>
                        {!isRenaming && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); setRenaming(c._id); setRenameValue(c.title); }}
                              className="w-6 h-6 rounded hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                              title="Rename"
                            ><FaPenAlt size={9} /></button>
                            <button
                              onClick={(e) => handleDelete(c._id, e)}
                              className="w-6 h-6 rounded hover:bg-red-100 text-red-500 flex items-center justify-center"
                              title="Delete"
                            ><FaTrash size={9} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-3 border-t border-slate-100">
          <Link href="/home" className="text-xs text-slate-500 hover:text-teal-700 inline-flex items-center gap-1.5 transition">
            <FaArrowLeft size={9} /> Back to dashboard
          </Link>
        </div>
      </aside>

      {/* SIDEBAR BACKDROP (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-20 sm:hidden"
        />
      )}

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">

        {/* TOPBAR */}
        <div className="border-b border-slate-100 bg-white/70 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="sm:hidden w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center"
          ><FaBars size={13} /></button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">
              {activeId ? (conversations.find((c) => String(c._id) === String(activeId))?.title || 'Conversation') : 'New conversation'}
            </p>
            {contextSnapshot?.productType && (
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                <FaRoad size={9} className="text-teal-600" />
                Working on {contextSnapshot.productType}
                {contextSnapshot.platform && <> · {contextSnapshot.platform}</>}
                {contextSnapshot.budgetTotal > 0 && <> · PKR {Number(contextSnapshot.budgetTotal).toLocaleString('en-PK')}</>}
              </p>
            )}
          </div>
        </div>

        {/* THREAD */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {loadingThread ? (
            <ThreadSkeleton />
          ) : thread.length === 0 ? (
            <EmptyThread onPick={(t) => { setDraft(t); }} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {thread.map((m, i) => <Bubble key={m._id || i} msg={m} />)}
              {sending && <TypingBubble />}
              <div ref={threadEndRef} />
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="px-4 sm:px-8 pb-2">
            <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2">
              <FaExclamationTriangle size={11} /> {error}
            </div>
          </div>
        )}

        {/* COMPOSER */}
        <div className="border-t border-slate-100 bg-white/70 backdrop-blur-sm px-4 sm:px-8 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-white border border-slate-200 hover:border-slate-300 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/30 rounded-2xl px-4 py-3 shadow-sm transition">
              <textarea
                rows={1}
                placeholder="Ask your mentor anything about e-commerce in Pakistan..."
                value={draft}
                maxLength={4000}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed max-h-40"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!draft.trim() || sending}
                className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white flex items-center justify-center shadow-md shadow-teal-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send (Enter)"
              >
                {sending ? <FaSpinner className="animate-spin" size={12} /> : <FaPaperPlane size={11} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Press Enter to send, Shift+Enter for new line. Mentor knows your active roadmap and budget.
            </p>
          </div>
        </div>
      </main>
    </section>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function Bubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
        isUser
          ? 'bg-slate-700 text-white'
          : 'bg-gradient-to-br from-teal-500 to-teal-700 text-white'
      }`}>
        {isUser ? <FaUser size={11} /> : <FaRobot size={11} />}
      </div>
      <div className={`group max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
          isUser
            ? 'bg-teal-600 text-white rounded-tr-sm'
            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none
              prose-p:text-slate-700 prose-p:my-1.5
              prose-headings:text-slate-900 prose-headings:font-bold
              prose-strong:text-slate-900
              prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
              prose-li:my-0.5 prose-ul:my-1.5 prose-ol:my-1.5
              prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
          <button
            onClick={copyToClipboard}
            className="mt-1 text-[10px] text-slate-400 hover:text-teal-700 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
          >
            {copied ? <><FaCheck size={9} /> Copied</> : <><FaCopy size={9} /> Copy</>}
          </button>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
        <FaRobot size={11} />
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function EmptyThread({ onPick }) {
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-600/30">
        <FaRobot className="text-white text-2xl" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
        Your e-commerce mentor
      </h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
        Ask anything about products, ads, returns, sourcing, or growth. I know your roadmap and budget — I will reference them when relevant.
      </p>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Try asking
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
        {STARTER_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="text-left text-sm text-slate-700 bg-white hover:bg-teal-50 hover:border-teal-200 border border-slate-200 px-4 py-3 rounded-xl transition shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 animate-pulse" />
          <div className={`max-w-[70%] ${i % 2 === 0 ? '' : 'items-end'} flex flex-col`}>
            <div className="bg-slate-100 rounded-2xl px-4 py-3 w-64 h-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
