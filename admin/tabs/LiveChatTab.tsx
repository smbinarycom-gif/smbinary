import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User, AdminThemeSettings } from '../../shared/types.ts';

interface LiveChatTabProps {
  users: User[];
  onUnreadChange: (count: number) => void;
  theme?: AdminThemeSettings;
}

type ChatPriority = 'HIGH' | 'MEDIUM' | 'LOW';
type ChatStatus = 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'BLOCKED';

type PresenceStatus = 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BLOCKED';

interface ChatMessage {
  id: string;
  sender: 'ADMIN' | 'USER';
  text: string;
  timestamp: number;
  status: 'SENT' | 'DELIVERED' | 'SEEN';
}

interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  priority: ChatPriority;
  status: ChatStatus;
  lastActivity: number;
  unreadCount: number;
  assignedTo: string;
  messages: ChatMessage[];
}

type ConversationFilter = 'ALL' | 'ACTIVE' | 'UNREAD' | 'PENDING' | 'RESOLVED';

const getPresence = (user: User | undefined): PresenceStatus => {
  if (!user) return 'OFFLINE';
  if (user.status === 'BLOCKED') return 'BLOCKED';
  const now = Date.now();
  const diff = now - user.lastLogin;
  if (diff < 5 * 60 * 1000) return 'ONLINE';
  if (diff < 30 * 60 * 1000) return 'AWAY';
  return 'OFFLINE';
};

const LiveChatTab: React.FC<LiveChatTabProps> = ({ users, onUnreadChange, theme }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<ConversationFilter>('ALL');
  const [messageInput, setMessageInput] = useState('');
  const [typingForId, setTypingForId] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLight = theme?.mode === 'LIGHT';
  const shellBg = isLight ? '#ffffff' : '#161a1e';
  const shellBorder = isLight ? '#e5e7eb' : '#2b3139';
  const sideBg = isLight ? '#f9fafb' : '#1e2329';
  const sideBorder = shellBorder;
  const headerBg = isLight ? '#f9fafb' : '#1e2329';
  const inputBg = isLight ? '#ffffff' : '#161a1e';
  const convoActiveClasses = isLight
    ? 'bg-[#e5e7eb] border-[#fcd535]'
    : 'bg-[#1f2933] border-[#fcd535]';
  const convoIdleClasses = isLight
    ? 'bg-transparent border-transparent hover:bg-[#f3f4f6]'
    : 'bg-transparent border-transparent hover:bg-[#111827]';

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Seed demo conversations from first few users
  useEffect(() => {
    if (!users.length) return;
    setConversations((prev) => {
      if (prev.length) return prev;
      const seedUsers = users.slice(0, 6);
      const seeded: ChatConversation[] = seedUsers.map((u, index) => {
        const baseTime = Date.now() - (index + 1) * 15 * 60 * 1000;
        const messages: ChatMessage[] = [
          {
            id: `${u.id}-m1`,
            sender: 'USER',
            text: 'Hi Admin, I need help with my trades.',
            timestamp: baseTime,
            status: 'SEEN',
          },
          {
            id: `${u.id}-m2`,
            sender: 'ADMIN',
            text: 'Sure, I am here to help. What happened?',
            timestamp: baseTime + 2 * 60 * 1000,
            status: 'SEEN',
          },
        ];
        return {
          id: `chat-${u.id}`,
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          priority: index === 0 ? 'HIGH' : index < 3 ? 'MEDIUM' : 'LOW',
          status: index === 0 ? 'ACTIVE' : 'PENDING',
          lastActivity: baseTime + 2 * 60 * 1000,
          unreadCount: index === 0 ? 1 : 0,
          assignedTo: 'Super Admin',
          messages,
        };
      });
      setActiveId(seeded[0]?.id || null);
      return seeded;
    });
  }, [users]);

  // Update unread total for sidebar badge
  useEffect(() => {
    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
    onUnreadChange(totalUnread);
  }, [conversations, onUnreadChange]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Auto-scroll to bottom when messages change or active chat changes
  useEffect(() => {
    if (!activeId) return;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeId, conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const visibleConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filterStatus === 'ACTIVE' && c.status !== 'ACTIVE') return false;
      if (filterStatus === 'UNREAD' && c.unreadCount === 0) return false;
      if (filterStatus === 'PENDING' && c.status !== 'PENDING') return false;
      if (filterStatus === 'RESOLVED' && c.status !== 'RESOLVED') return false;

      if (!filterText.trim()) return true;
      const search = filterText.toLowerCase();
      return (
        c.userName.toLowerCase().includes(search) ||
        c.userEmail.toLowerCase().includes(search) ||
        c.userId.toLowerCase().includes(search)
      );
    });
  }, [conversations, filterStatus, filterText]);

  const quickReplies = [
    'Hello 👋 How can I help you today?',
    'Please wait a moment while I check this for you.',
    'Can you share a screenshot of the issue?',
    'Your request has been forwarded to our risk team.',
  ];

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0, status: c.status === 'PENDING' ? 'ACTIVE' : c.status } : c))
    );
  };

  const handleSendMessage = (text?: string) => {
    const content = (text ?? messageInput).trim();
    if (!content || !activeConversation) return;

    const convId = activeConversation.id;
    const convName = activeConversation.userName;

    const now = Date.now();
    const newMessage: ChatMessage = {
      id: `${convId}-${now}`,
      sender: 'ADMIN',
      text: content,
      timestamp: now,
      status: 'SENT',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastActivity: now,
            }
          : c
      )
    );
    setMessageInput('');

    // Simulate delivery + user typing + auto reply for demo
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMessage.id ? { ...m, status: 'DELIVERED' } : m
                ),
              }
            : c
        )
      );
    }, 600);

    setTimeout(() => {
      setTypingForId(convId);
    }, 800);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `${convId}-${now}-reply`,
        sender: 'USER',
        text: 'Thanks, I understand now. 🙌',
        timestamp: Date.now(),
        status: 'SEEN',
      };
      setTypingForId((current) => (current === convId ? null : current));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, reply],
                lastActivity: reply.timestamp,
                unreadCount: activeIdRef.current === convId ? 0 : c.unreadCount + 1,
                status: c.status === 'RESOLVED' ? 'ACTIVE' : c.status,
              }
            : c
        )
      );
      setToast(`New reply from ${convName}`);
    }, 2100);
  };

  const handleResolve = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, status: 'RESOLVED' } : c))
    );
  };

  const handleReopen = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, status: 'ACTIVE' } : c))
    );
  };

  const handleBlockUser = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, status: 'BLOCKED' } : c))
    );
  };

  const presenceForConversation = (conv: ChatConversation): PresenceStatus => {
    const user = users.find((u) => u.id === conv.userId);
    return getPresence(user);
  };

  const renderPresenceDot = (status: PresenceStatus) => {
    if (status === 'BLOCKED') return 'bg-[#f97316]';
    if (status === 'ONLINE') return 'bg-[#22c55e]';
    if (status === 'AWAY') return 'bg-[#eab308]';
    return 'bg-[#4b5563]';
  };

  const renderPresenceLabel = (status: PresenceStatus) => {
    if (status === 'BLOCKED') return 'Blocked';
    if (status === 'ONLINE') return 'Online';
    if (status === 'AWAY') return 'Away';
    return 'Offline';
  };

  return (
    <div
      className="flex h-full min-h-0 rounded-lg border overflow-hidden"
      style={{ backgroundColor: shellBg, borderColor: shellBorder }}
    >
      {/* Conversation list sidebar */}
      <aside
        className="w-72 flex flex-col border-r"
        style={{ backgroundColor: sideBg, borderColor: sideBorder }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: sideBorder, backgroundColor: headerBg }}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#fcd535]">Support</p>
            <h3 className={`text-sm font-semibold tracking-tight ${isLight ? 'text-[#111827]' : 'text-white'}`}>Live Chat</h3>
          </div>
        </div>

        <div className="px-3 pt-2 pb-2 border-b space-y-2" style={{ borderColor: sideBorder }}>
          <div className="flex items-center gap-2 text-[10px]">
            {(['ALL', 'ACTIVE', 'UNREAD'] as ConversationFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterStatus(f)}
                className={`px-2 py-1 rounded-full border transition-colors ${
                  filterStatus === f
                    ? 'bg-[#fcd535] border-[#fcd535] text-[#111827] font-semibold'
                    : 'border text-[#6b7280]'
                }`}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            {(['PENDING', 'RESOLVED'] as ConversationFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterStatus(f)}
                className={`px-2 py-1 rounded-full border transition-colors ${
                  filterStatus === f
                    ? 'bg-[#fcd535] border-[#fcd535] text-[#111827] font-semibold'
                    : 'border text-[#6b7280]'
                }`}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>
          <div className="relative text-[11px]">
            <i className="fa-solid fa-magnifying-glass absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-[#6b7280]" />
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search by name, id, email..."
              className="w-full rounded-lg pl-7 pr-2 py-1.5 text-[11px] focus:outline-none focus:border-[#fcd535]"
              style={{ backgroundColor: inputBg, borderColor: shellBorder, color: isLight ? '#020617' : '#ffffff' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          {visibleConversations.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-[#9ca3af]">
              No chats found. Users will appear here once they contact support.
            </div>
          )}
          <ul className="space-y-1 px-2">
            {visibleConversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const presence = presenceForConversation(conv);
              const isActive = conv.id === activeId;
              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                      isActive ? convoActiveClasses : convoIdleClasses
                    }`}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fcd535] to-[#f59e0b] flex items-center justify-center text-[#111827] text-xs font-bold">
                        {conv.userName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 ${renderPresenceDot(
                          presence
                        )}`}
                        style={{ borderColor: sideBg }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[11px] font-semibold truncate ${isLight ? 'text-[#111827]' : 'text-white'}`}>{conv.userName}</p>
                        <span className="text-[9px] text-[#6b7280] whitespace-nowrap">
                          {new Date(conv.lastActivity).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9ca3af] truncate">{lastMsg?.text || 'No messages yet'}</p>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[9px]">
                        <span className="inline-flex items-center gap-1 text-[#6b7280]">
                          <i className="fa-regular fa-user" />
                          {renderPresenceLabel(presence)}
                        </span>
                        <div className="flex items-center gap-1">
                          {conv.priority === 'HIGH' && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#450a0a] text-[#fed7aa] text-[9px] font-semibold">
                              HIGH
                            </span>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#f6465d] text-white text-[9px] font-bold min-w-[18px] text-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Chat window */}
      <section className="flex-1 flex flex-col" style={{ backgroundColor: shellBg }}>
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <div
                className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center text-[#f59e0b]"
                style={{ backgroundColor: isLight ? '#e5e7eb' : '#2b3139' }}
              >
                <i className="fa-regular fa-comments text-lg" />
              </div>
              <p className={`text-sm font-semibold ${isLight ? 'text-[#111827]' : 'text-white'}`}>Select a conversation to start chatting</p>
              <p className="mt-1 text-[11px] text-[#9ca3af]">
                All active user support chats will appear here. You can manage multiple conversations side by side.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <header
              className="h-14 border-b flex items-center justify-between px-4"
              style={{ borderColor: shellBorder, backgroundColor: headerBg }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fcd535] to-[#f97316] flex items-center justify-center text-[#111827] text-xs font-bold">
                    {activeConversation.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 ${renderPresenceDot(
                      presenceForConversation(activeConversation)
                    )}`}
                    style={{ borderColor: headerBg }}
                  />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${isLight ? 'text-[#111827]' : 'text-white'}`}>{activeConversation.userName}</p>
                  <p className="text-[10px] text-[#9ca3af] truncate">{activeConversation.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span
                  className="px-2 py-0.5 rounded-full border text-[9px] flex items-center gap-1"
                  style={{ backgroundColor: inputBg, borderColor: shellBorder, color: isLight ? '#374151' : '#9ca3af' }}
                >
                  <i className="fa-solid fa-user-shield text-[9px]" />
                  {activeConversation.assignedTo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[9px] ${
                    activeConversation.status === 'RESOLVED'
                      ? isLight
                        ? 'bg-[#dcfce7] border-[#22c55e]/60 text-[#166534]'
                        : 'bg-[#022c22] border-[#16a34a]/60 text-[#bbf7d0]'
                      : activeConversation.status === 'BLOCKED'
                      ? isLight
                        ? 'bg-[#fee2e2] border-[#f97316]/60 text-[#b91c1c]'
                        : 'bg-[#450a0a] border-[#f97316]/60 text-[#fed7aa]'
                      : isLight
                      ? 'bg-[#e5e7eb] border-[#d1d5db] text-[#111827]'
                      : 'bg-[#111827] border-[#374151] text-[#e5e7eb]'
                  }`}
                >
                  {activeConversation.status === 'BLOCKED'
                    ? 'Blocked'
                    : activeConversation.status === 'RESOLVED'
                    ? 'Resolved'
                    : 'Active chat'}
                </span>
                <button
                  type="button"
                  onClick={handleResolve}
                  className={`px-2 py-0.5 rounded-full text-[9px] border ${
                    isLight
                      ? 'bg-white border-[#d1d5db] text-[#111827] hover:bg-[#e5e7eb]'
                      : 'bg-[#111827] border-[#374151] text-[#9ca3af] hover:text-[#bbf7d0]'
                  }`}
                >
                  Mark resolved
                </button>
                {activeConversation.status === 'RESOLVED' && (
                  <button
                    type="button"
                    onClick={handleReopen}
                    className={`px-2 py-0.5 rounded-full text-[9px] border ${
                      isLight
                        ? 'bg-white border-[#d1d5db] text-[#111827] hover:bg-[#e5e7eb]'
                        : 'bg-[#161a1e] border-[#4b5563] text-[#e5e7eb]'
                    }`}
                  >
                    Reopen
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBlockUser}
                  className="px-2 py-0.5 rounded-full bg-[#450a0a] border border-[#f97316]/60 text-[#fed7aa] text-[9px]"
                >
                  Block
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2">
              {activeConversation.messages.map((m) => {
                const isAdmin = m.sender === 'ADMIN';
                return (
                  <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] space-y-0.5 ${isAdmin ? 'items-end text-right' : 'items-start text-left'}`}>
                      <div
                        className={`inline-block rounded-2xl px-3 py-1.5 text-[11px] leading-snug shadow-sm ${
                          isAdmin
                            ? 'bg-gradient-to-tr from-[#fcd535] to-[#f97316] text-[#111827]'
                            : 'bg-[#111827] text-[#e5e7eb] border border-[#272f3b]'
                        }`}
                      >
                        {m.text}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-[#6b7280]">
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isAdmin && (
                          <span>
                            {m.status === 'SENT' && <i className="fa-solid fa-check" />}
                            {m.status === 'DELIVERED' && <i className="fa-solid fa-check-double" />}
                            {m.status === 'SEEN' && <i className="fa-solid fa-circle-check text-[#22c55e]" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingForId === activeConversation.id && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 border text-[10px] text-[#6b7280]" style={{ backgroundColor: inputBg, borderColor: shellBorder }}>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6b7280] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6b7280] animate-bounce delay-150" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6b7280] animate-bounce delay-300" />
                    </span>
                    <span>User is typing…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {showQuickReplies && (
              <div className="px-4 pt-2 pb-1 border-t flex flex-wrap gap-1.5 text-[10px]" style={{ borderColor: shellBorder, backgroundColor: shellBg }}>
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="px-2 py-1 rounded-full border hover:border-[#fcd535] hover:text-[#fcd535]"
                    style={{ backgroundColor: sideBg, borderColor: shellBorder, color: isLight ? '#111827' : '#e5e7eb' }}
                  >
                    {q}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowQuickReplies((v) => !v)}
                  className="ml-auto px-2 py-1 rounded-full border"
                  style={{ backgroundColor: inputBg, borderColor: shellBorder, color: isLight ? '#374151' : '#9ca3af' }}
                >
                  {showQuickReplies ? 'Hide' : 'Show'} templates
                </button>
              </div>
            )}

            {/* Input bar */}
            <footer
              className="h-16 border-t flex items-center gap-2 px-4"
              style={{ borderColor: shellBorder, backgroundColor: headerBg }}
            >
              <button
                type="button"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:text-white"
                style={{ backgroundColor: inputBg, borderColor: shellBorder, color: isLight ? '#6b7280' : '#9ca3af' }}
                title="Add emoji"
                onClick={() => setMessageInput((prev) => `${prev} 🙂`)}
              >
                <i className="fa-regular fa-face-smile" />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:text-white"
                style={{ backgroundColor: inputBg, borderColor: shellBorder, color: isLight ? '#6b7280' : '#9ca3af' }}
                title="Attach file"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-paperclip" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file || !activeConversation) return;
                  const info = `Sent attachment: ${file.name}`;
                  const nowTs = Date.now();
                  const attachmentMessage: ChatMessage = {
                    id: `${activeConversation.id}-file-${nowTs}`,
                    sender: 'ADMIN',
                    text: info,
                    timestamp: nowTs,
                    status: 'SENT',
                  };
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === activeConversation.id
                        ? {
                            ...c,
                            messages: [...c.messages, attachmentMessage],
                            lastActivity: nowTs,
                          }
                        : c
                    )
                  );
                  e.target.value = '';
                }}
              />
              <div className="flex-1 relative">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message…"
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#fcd535]"
                  style={{ backgroundColor: inputBg, borderColor: shellBorder, color: isLight ? '#020617' : '#ffffff' }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="px-3 py-2 rounded-lg bg-[#fcd535] text-[#111827] text-xs font-semibold hover:bg-[#fbbf24] flex items-center gap-1"
              >
                <i className="fa-solid fa-paper-plane text-[10px]" />
                Send
              </button>
            </footer>
          </>
        )}
      </section>

      {/* Simple toast for new user message */}
      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50">
          <div
            className="pointer-events-auto rounded-xl px-3 py-2 text-[11px] shadow-xl flex items-center gap-2 border"
            style={{ backgroundColor: isLight ? '#ffffff' : '#020617', borderColor: shellBorder, color: isLight ? '#020617' : '#e5e7eb' }}
          >
            <i className="fa-regular fa-message text-[#fcd535]" />
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChatTab;
