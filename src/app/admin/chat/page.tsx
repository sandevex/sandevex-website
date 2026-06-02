"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  MessageSquare,
  Send,
  Plus,
  User,
  Search,
  AtSign,
  Loader2,
  ArrowLeft,
  Mail,
  Shield,
  Globe,
  Users,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  Smile,
  MoreVertical,
  Bell,
  BellOff,
} from "lucide-react";
import { useAdmin } from "@/components/AdminContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ─── Types ───────────────────────────────────────────────────── */
interface DirectoryMember {
  email: string;
  name: string;
  role: string;
  isStudent: boolean;
}

interface ChatMessage {
  docId: string;
  chatId: string;
  senderEmail: string;
  senderName: string;
  text: string;
  mentions?: string[];
  createdAt: string;
  editedAt?: string;
}

/* ─── Common emoji set ────────────────────────────────────────── */
const QUICK_EMOJIS = [
  "😊","👍","🎉","🔥","✅","❤️","😂","🙏","💯","🚀",
  "👀","💪","😅","🤔","📌","✨","🎯","⚡","🙌","😍",
];

/* ─── Sound helper ────────────────────────────────────────────── */
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.35);
  } catch { /* ignore */ }
}

/* ─── Profile Popover ─────────────────────────────────────────── */
function ProfilePopover({
  member,
  onClose,
  onDM,
}: {
  member: DirectoryMember;
  onClose: () => void;
  onDM?: (email: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(member.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden animate-scale-in">
        {/* Header gradient */}
        <div className="h-20 bg-gradient-to-r from-emerald-900/60 to-zinc-900 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-900/60 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-5 -mt-8 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-black text-zinc-950 border-4 border-zinc-900 shadow-xl mb-3">
            {(member.name || member.email)[0].toUpperCase()}
          </div>

          <h3 className="text-base font-extrabold text-white">{member.name || member.email}</h3>
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
            {member.isStudent ? <User size={9} /> : <Shield size={9} />}
            {member.role}
          </span>

          {/* Email row with copy */}
          <div className="mt-4 flex items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={12} className="text-zinc-500 shrink-0" />
              <p className="text-[11px] font-mono text-zinc-400 truncate">{member.email}</p>
            </div>
            <button
              onClick={copyEmail}
              title="Copy email"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400 transition-all shrink-0 cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>

          {/* DM button */}
          {onDM && (
            <button
              onClick={() => { onDM(member.email); onClose(); }}
              className="mt-3 w-full py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-[#10b981] text-zinc-950 rounded-xl hover:from-emerald-600 hover:to-emerald-500 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              💬 Send Direct Message
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Message Bubble ──────────────────────────────────────────── */
function MessageBubble({
  msg,
  isMine,
  allowDelete,
  onEdit,
  onDelete,
  onProfileClick,
  directory,
}: {
  msg: ChatMessage;
  isMine: boolean;
  allowDelete: boolean;
  onEdit: (msg: ChatMessage) => void;
  onDelete: (docId: string) => void;
  onProfileClick: (email: string) => void;
  directory: DirectoryMember[];
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const canDelete = allowDelete || isMine;
  const canEdit = isMine;

  // Render text with @mention highlights
  const renderText = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((word, i) => {
      if (word.startsWith("@")) {
        // Try to resolve @email to a name
        const raw = word.slice(1);
        const match = directory.find(m => m.email === raw);
        const displayTag = match ? `@${match.name || raw}` : word;
        return (
          <span
            key={i}
            className={`font-black tracking-wide px-1.5 py-0.5 rounded cursor-pointer ${
              isMine
                ? "bg-zinc-950/20 text-zinc-950"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
            onClick={() => match && onProfileClick(match.email)}
          >
            {displayTag}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <div
      className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[82%] ${
        isMine ? "ml-auto" : "mr-auto"
      } group`}
    >
      {/* Sender name for others */}
      {!isMine && (
        <button
          onClick={() => onProfileClick(msg.senderEmail)}
          className="text-[10px] font-bold text-zinc-500 hover:text-emerald-400 mb-1 ml-1.5 transition-colors cursor-pointer"
        >
          {msg.senderName}
        </button>
      )}

      <div className="relative flex items-end gap-1.5">
        {/* Context menu (left of bubble for mine, right for others) */}
        {isMine && (canEdit || canDelete) && (
          <div
            ref={menuRef}
            className="relative opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <MoreVertical size={13} />
            </button>
            {showMenu && (
              <div className="absolute bottom-full right-0 mb-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[120px]">
                {canEdit && (
                  <button
                    onClick={() => { onEdit(msg); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => { onDelete(msg.docId); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div
          className={`p-3.5 rounded-3xl text-xs leading-relaxed break-words shadow-md relative ${
            isMine
              ? "bg-gradient-to-r from-emerald-500 to-[#10b981] text-zinc-950 font-semibold rounded-br-none"
              : "bg-zinc-800 border border-zinc-750 text-zinc-150 rounded-bl-none"
          }`}
        >
          <div className="whitespace-pre-wrap">{renderText(msg.text)}</div>
          {msg.editedAt && (
            <span className={`block text-[8px] mt-1 opacity-60 ${isMine ? "text-zinc-900" : "text-zinc-500"}`}>
              edited
            </span>
          )}
        </div>

        {/* Context menu for others (admin delete) */}
        {!isMine && allowDelete && (
          <div
            ref={menuRef}
            className="relative opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <MoreVertical size={13} />
            </button>
            {showMenu && (
              <div className="absolute bottom-full left-0 mb-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[120px]">
                <button
                  onClick={() => { onDelete(msg.docId); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <span className="text-[9px] text-zinc-500 mt-1 mr-1 ml-1 font-medium">
        {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ChatCenterPage() {
  const { user, allowDelete } = useAdmin();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [directory, setDirectory] = useState<DirectoryMember[]>([]);

  // Loading
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);

  // Input
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // New chat modal
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [chatModalTab, setChatModalTab] = useState<"direct" | "group">("direct");
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Mention autocomplete
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Edit mode
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [editText, setEditText] = useState("");

  // Profile popover
  const [profileMember, setProfileMember] = useState<DirectoryMember | null>(null);

  // Sound/notifications
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastMsgCountRef = useRef(0);
  const activeChatIdRef = useRef<string | null>(null);

  // Refs
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // ── Keep activeChatId ref in sync
  useEffect(() => {
    activeChatIdRef.current = activeChat?.docId ?? null;
  }, [activeChat]);

  // ── Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Load directory
  useEffect(() => {
    if (user?.email) fetchDirectory();
  }, [user?.email]);

  const fetchDirectory = async () => {
    try {
      const [usersRes, studentsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/students?role=admin"),
      ]);
      const usersData = await usersRes.json();
      const studentsData = await studentsRes.json();

      const teamList: DirectoryMember[] = (usersData.users || []).map((u: any) => ({
        email: u.email,
        name: u.name,
        role: u.role,
        isStudent: false,
      }));
      const studentList: DirectoryMember[] = (studentsData.students || []).map((s: any) => ({
        email: s.email,
        name: s.name,
        role: "Student",
        isStudent: true,
      }));

      setDirectory([...teamList, ...studentList].filter(m => m.email !== user?.email));
    } catch (err) {
      console.error("Failed to load directory:", err);
    }
  };

  // ── Real-time chats stream (WhatsApp-style)
  useEffect(() => {
    if (!user?.email) return;

    const chatsRef = collection(db, "chats");
    const qPersonal = query(chatsRef, where("participants", "array-contains", user.email));
    const qGlobal = query(chatsRef, where("type", "==", "global"));

    let personalChats: any[] = [];
    let globalChats: any[] = [];

    const merge = () => {
      const all = [...globalChats, ...personalChats];
      const unique = all.filter((c, i, s) => s.findIndex(x => x.docId === c.docId) === i);
      unique.sort((a, b) => {
        const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return tB - tA;
      });
      setChats(unique);
      setLoadingChats(false);
    };

    const unsubPersonal = onSnapshot(qPersonal, snap => {
      personalChats = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      merge();
    }, err => console.error("Personal chats error:", err));

    const unsubGlobal = onSnapshot(qGlobal, snap => {
      globalChats = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      merge();
    }, err => console.error("Global chats error:", err));

    return () => { unsubPersonal(); unsubGlobal(); };
  }, [user?.email]);

  // ── Auto-create global channel if missing
  useEffect(() => {
    if (!loadingChats && user?.email && !chats.some(c => c.type === "global")) {
      fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: ["global"], type: "global", name: "📢 Global Announcements Hub" }),
      }).catch(console.error);
    }
  }, [loadingChats, chats, user?.email]);

  // ── Real-time messages stream
  useEffect(() => {
    if (!activeChat) { setMessages([]); return; }

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", activeChat.docId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, snap => {
      const msgs: ChatMessage[] = snap.docs.map(d => ({ docId: d.id, ...d.data() } as ChatMessage));

      // Sound on new incoming message
      const prev = lastMsgCountRef.current;
      if (msgs.length > prev && prev > 0) {
        const newest = msgs[msgs.length - 1];
        if (newest.senderEmail !== user?.email && soundEnabled) {
          playNotifSound();
        }
      }
      lastMsgCountRef.current = msgs.length;

      setMessages(msgs);
      setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    });

    return () => unsub();
  }, [activeChat, soundEnabled]);

  // ── Mark chat as read
  const markAsRead = useCallback(async (chatId: string) => {
    if (!user?.email) return;
    const key = user.email.replace(/\./g, "_");
    try {
      await updateDoc(doc(db, "chats", chatId), {
        [`lastRead.${key}`]: new Date().toISOString(),
      });
    } catch { /* ignore */ }
  }, [user?.email]);

  useEffect(() => {
    if (activeChat && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last?.senderEmail !== user?.email) markAsRead(activeChat.docId);
    }
  }, [activeChat, messages]);

  // ── Unread detection
  const isChatUnread = (chat: any) => {
    if (!user?.email) return false;
    if (chat.lastMessageSender === user.email) return false;
    const key = user.email.replace(/\./g, "_");
    const readTime = chat.lastRead?.[key];
    if (!readTime) return !!chat.lastMessageText;
    return new Date(chat.updatedAt || 0).getTime() > new Date(readTime).getTime();
  };

  // ── Get display name for a chat
  const getChatName = (chat: any) => {
    if (chat.type === "global") return chat.name || "Global Announcements Hub";
    if (chat.type === "group") return chat.name || "Group Chat";
    const recipient = chat.participants?.find((p: string) => p !== user?.email);
    const match = directory.find(m => m.email === recipient);
    return match?.name || recipient || "Conversation";
  };

  // ── Get last message preview (resolve email→name in prefix)
  const getLastMsgPreview = (chat: any) => {
    if (!chat.lastMessageText) return "No messages yet";
    if (chat.lastMessageSender === user?.email) return `You: ${chat.lastMessageText}`;
    const senderName = chat.lastMessageSenderName || chat.lastMessageSender?.split("@")[0] || "";
    return `${senderName}: ${chat.lastMessageText}`;
  };

  // ── Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = text.trim();
    if (!payload || !activeChat) return;

    setSending(true);
    setText("");
    setShowMentionPopover(false);
    setShowEmojiPicker(false);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat.docId,
          senderEmail: user?.email,
          senderName: user?.displayName || directory.find(m => m.email === user?.email)?.name || user?.email?.split("@")[0] || "Unknown",
          text: payload,
        }),
      });
      if (!res.ok) throw new Error("Send failed");
    } catch (err) {
      console.error(err);
      setText(payload);
    } finally {
      setSending(false);
    }
  };

  // ── Edit message
  const handleEditSave = async () => {
    if (!editingMsg || !editText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${editingMsg.docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText.trim(), editorEmail: user?.email }),
      });
      if (!res.ok) throw new Error("Edit failed");
      setEditingMsg(null);
      setEditText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // ── Delete message
  const handleDeleteMessage = async (docId: string) => {
    try {
      await fetch(`/api/messages/${docId}?deleterEmail=${encodeURIComponent(user?.email || "")}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Mention autocomplete
  const handleInputChange = (val: string) => {
    setText(val);
    const cursor = inputRef.current?.selectionStart || 0;
    const beforeCursor = val.slice(0, cursor);
    const lastWord = beforeCursor.split(/\s/).pop() || "";
    if (lastWord.startsWith("@")) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
      setShowMentionPopover(true);
    } else {
      setShowMentionPopover(false);
    }
  };

  const selectMention = (member: DirectoryMember) => {
    const cursor = inputRef.current?.selectionStart || 0;
    const before = text.slice(0, cursor);
    const after = text.slice(cursor);
    const words = before.split(/\s/);
    words.pop();
    const completed = [...words, `@${member.email}`].join(" ") + " " + after;
    setText(completed);
    setShowMentionPopover(false);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  // ── Start DM
  const startDirectChat = async (targetEmail: string) => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: [user?.email, targetEmail], type: "direct" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsNewChatModalOpen(false);
      setModalSearch("");
      setActiveChat({ docId: data.docId, ...data.chat });
      markAsRead(data.docId);
    } catch (err) {
      console.error(err);
      alert("Failed to start chat");
    }
  };

  // ── Create group
  const createGroupChat = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: [user?.email, ...selectedParticipants],
          type: "group",
          name: groupName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsNewChatModalOpen(false);
      setGroupName("");
      setSelectedParticipants([]);
      setModalSearch("");
      setActiveChat({ docId: data.docId, ...data.chat });
      markAsRead(data.docId);
    } catch (err) {
      console.error(err);
      alert("Failed to create group chat");
    } finally {
      setSending(false);
    }
  };

  // ── Profile popover helper
  const openProfile = (email: string) => {
    const match = directory.find(m => m.email === email);
    if (match) setProfileMember(match);
  };

  // ── Filtered lists
  const filteredChats = chats.filter(c =>
    getChatName(c).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalList = directory.filter(m => {
    const q = modalSearch.toLowerCase();
    return m.name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
  });

  const mentionList = directory.filter(m => {
    const q = mentionQuery;
    return m.name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  }).slice(0, 6);

  return (
    <div className="h-[calc(100vh-130px)] text-white relative flex gap-6 overflow-hidden">

      {/* Profile popover */}
      {profileMember && (
        <ProfilePopover
          member={profileMember}
          onClose={() => setProfileMember(null)}
          onDM={startDirectChat}
        />
      )}

      {/* Edit message modal */}
      {editingMsg && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Pencil size={14} className="text-emerald-400" /> Edit Message
              </h3>
              <button onClick={() => setEditingMsg(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                autoFocus
                rows={4}
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingMsg(null)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={!editText.trim() || sending}
                  className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-[#10b981] text-zinc-950 rounded-xl hover:from-emerald-600 hover:to-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {sending ? <Loader2 size={13} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Left Sidebar ─────────────────────────────────────── */}
      <div className={`w-full md:w-[320px] bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full overflow-hidden ${activeChat ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="text-emerald-400" size={18} />
            Chat Center
          </h2>
          <div className="flex items-center gap-1.5">
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(v => !v)}
              title={soundEnabled ? "Mute notification sound" : "Enable notification sound"}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer"
            >
              {soundEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            </button>
            <button
              onClick={() => { setIsNewChatModalOpen(true); setChatModalTab("direct"); setGroupName(""); setSelectedParticipants([]); setModalSearch(""); }}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all cursor-pointer text-emerald-400"
              title="New Chat"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {loadingChats ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
              <MessageSquare size={32} className="mb-2 opacity-40" />
              <p className="text-xs">No conversations yet</p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-3 text-emerald-500 text-xs font-bold hover:underline cursor-pointer"
              >
                + Start one
              </button>
            </div>
          ) : (
            filteredChats.map(chat => {
              const isSelected = activeChat?.docId === chat.docId;
              const isUnread = isChatUnread(chat);
              return (
                <div
                  key={chat.docId}
                  onClick={() => { setActiveChat(chat); markAsRead(chat.docId); }}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#18cb96]/10 border-emerald-500/30 text-[#18cb96] shadow-md"
                      : "bg-zinc-950/20 border-transparent hover:border-zinc-800 hover:bg-zinc-800/40 text-zinc-300"
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? "bg-emerald-500/10" : "bg-zinc-950 border border-zinc-800"}`}>
                    {chat.type === "global" ? (
                      <Globe size={16} className={isSelected ? "text-emerald-400" : "text-zinc-500"} />
                    ) : chat.type === "group" ? (
                      <Users size={16} className={isSelected ? "text-emerald-400" : "text-zinc-500"} />
                    ) : (
                      <User size={16} className={isSelected ? "text-emerald-400" : "text-zinc-500"} />
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate leading-snug ${isUnread ? "font-extrabold text-white" : "font-semibold text-zinc-300"}`}>
                        {getChatName(chat)}
                      </p>
                      {chat.updatedAt && (
                        <span className="text-[8px] text-zinc-500 font-medium shrink-0 ml-1">
                          {new Date(chat.updatedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-[10px] truncate ${isUnread ? "font-bold text-emerald-400" : "text-zinc-500"}`}>
                        {getLastMsgPreview(chat)}
                      </p>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1.5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: Chat Stream ────────────────────────────────── */}
      <div className={`flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full overflow-hidden ${!activeChat ? "hidden md:flex justify-center items-center" : "flex"}`}>
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveChat(null)}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg md:hidden transition-colors cursor-pointer text-zinc-400"
                >
                  <ArrowLeft size={16} />
                </button>
                {/* Clickable chat title (opens profile for DMs) */}
                <div className="text-left">
                  <button
                    className="text-xs font-extrabold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                    onClick={() => {
                      if (activeChat.type === "direct") {
                        const recipient = activeChat.participants?.find((p: string) => p !== user?.email);
                        if (recipient) openProfile(recipient);
                      }
                    }}
                  >
                    {getChatName(activeChat)}
                  </button>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-0.5">
                    {activeChat.type === "global"
                      ? "📢 Public Channel"
                      : activeChat.type === "group"
                      ? `👥 Group · ${activeChat.participants?.length || 0} members`
                      : "🔒 Direct Message"}
                  </p>
                </div>
              </div>

              {/* Group member avatars */}
              {activeChat.type === "group" && (
                <div className="flex -space-x-2">
                  {activeChat.participants?.slice(0, 4).map((email: string) => {
                    const m = directory.find(d => d.email === email);
                    return (
                      <button
                        key={email}
                        title={m?.name || email}
                        onClick={() => openProfile(email)}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-950 cursor-pointer"
                      >
                        {(m?.name || email)[0].toUpperCase()}
                      </button>
                    );
                  })}
                  {(activeChat.participants?.length || 0) > 4 && (
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                      +{activeChat.participants.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/10 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-30 animate-bounce" />
                  <p className="text-xs font-medium">Start the conversation!</p>
                  <p className="text-[10px] opacity-75 mt-0.5">Type "@" to mention anyone.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg.docId || idx}
                    msg={msg}
                    isMine={msg.senderEmail === user?.email}
                    allowDelete={allowDelete}
                    onEdit={m => { setEditingMsg(m); setEditText(m.text); }}
                    onDelete={handleDeleteMessage}
                    onProfileClick={openProfile}
                    directory={directory}
                  />
                ))
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 relative">
              {/* Mention popover */}
              {showMentionPopover && mentionList.length > 0 && (
                <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 max-h-40 overflow-y-auto custom-scrollbar">
                  <p className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest px-2 mb-1.5 flex items-center gap-1">
                    <AtSign size={9} /> Tag Someone
                  </p>
                  {mentionList.map(m => (
                    <div
                      key={m.email}
                      onClick={() => selectMention(m)}
                      className="flex items-center justify-between p-2 hover:bg-zinc-950 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-black text-zinc-950">
                          {(m.name || m.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{m.name}</p>
                          <p className="text-[9px] text-zinc-500 font-mono">{m.email}</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Emoji picker */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-[calc(100%-8px)] left-4 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3"
                >
                  <div className="grid grid-cols-10 gap-1">
                    {QUICK_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { setText(t => t + emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                        className="text-lg hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSend} className="flex gap-3 items-end">
                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer shrink-0"
                >
                  <Smile size={16} />
                </button>

                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 focus-within:border-emerald-500 transition-colors">
                  <textarea
                    ref={inputRef}
                    required
                    rows={1}
                    value={text}
                    onChange={e => handleInputChange(e.target.value)}
                    placeholder={`Message ${getChatName(activeChat)}... type '@' to mention`}
                    className="w-full bg-transparent resize-none outline-none text-xs text-white max-h-24 custom-scrollbar py-0.5 leading-relaxed"
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e as unknown as React.FormEvent);
                      }
                      if (e.key === "Escape") {
                        setShowMentionPopover(false);
                        setShowEmojiPicker(false);
                      }
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-zinc-950 p-3.5 rounded-2xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <div className="w-20 h-20 rounded-3xl bg-zinc-800/60 flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Collaborative Workspace</h3>
            <p className="text-xs text-zinc-500 max-w-sm text-center leading-relaxed">
              Select a conversation from the left or start a new direct message, group, or use the Global Channel.
            </p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="mt-5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-[#10b981] text-zinc-950 text-xs font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-500 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              + Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* ── New Chat Modal ────────────────────────────────────── */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
              <h2 className="text-md font-bold flex items-center gap-2">
                <MessageSquare className="text-emerald-400" size={16} />
                New Conversation
              </h2>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-zinc-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-950 p-1 gap-1">
              {(["direct", "group"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setChatModalTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    chatModalTab === tab
                      ? "bg-zinc-900 text-emerald-400 border border-zinc-800 shadow"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab === "direct" ? "💬 Direct Message" : "👥 Create Group"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-3.5 border-b border-zinc-800">
              {chatModalTab === "group" && (
                <input
                  type="text"
                  placeholder="Group name (e.g. Fullstack Cohort A)"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white mb-3 focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                />
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-3.5 w-3.5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Directory */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2 custom-scrollbar">
              {modalList.length === 0 ? (
                <p className="text-center text-xs text-zinc-600 py-10">No users found.</p>
              ) : (
                modalList.map(member => {
                  const isSelected = selectedParticipants.includes(member.email);
                  return (
                    <div
                      key={member.email}
                      onClick={() =>
                        chatModalTab === "direct"
                          ? startDirectChat(member.email)
                          : setSelectedParticipants(prev =>
                              prev.includes(member.email)
                                ? prev.filter(e => e !== member.email)
                                : [...prev, member.email]
                            )
                      }
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                        isSelected && chatModalTab === "group"
                          ? "bg-[#18cb96]/10 border-emerald-500/40"
                          : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-black text-zinc-950 shrink-0">
                          {(member.name || member.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{member.name || member.email}</p>
                          <p className="text-[10px] font-mono text-zinc-500 truncate flex items-center gap-1">
                            <Mail size={9} className="text-zinc-600" /> {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">
                          {member.role}
                        </span>
                        {chatModalTab === "group" && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 rounded accent-emerald-500"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Group create footer */}
            {chatModalTab === "group" && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex gap-3">
                <button
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroupChat}
                  disabled={!groupName.trim() || selectedParticipants.length === 0 || sending}
                  className="flex-1 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-[#10b981] text-zinc-950 rounded-xl transition-all cursor-pointer disabled:opacity-40 shadow-lg shadow-emerald-500/20"
                >
                  {sending ? "Creating..." : `Create Group (${selectedParticipants.length + 1})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
