import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { chatService } from "../api";
import { ChatMessage } from "../types";

const POLL_INTERVAL_MS = 5000;
const MESSAGE_LIMIT = 100;
const AUTHOR_STORAGE_KEY = "liveChatAuthor";

type ChatPanelVariant = "default" | "overlay";

interface ChatPanelProps {
  variant?: ChatPanelVariant;
  onClose?: () => void;
}

const formatTimestamp = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

export default function ChatPanel({ variant = "default", onClose }: ChatPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState(() => localStorage.getItem(AUTHOR_STORAGE_KEY) ?? "");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const latestMessageTime = useMemo(
    () => (messages.length ? messages[messages.length - 1].createdAt : undefined),
    [messages]
  );

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) {
      return;
    }
    setMessages((prev) => {
      const seen = new Set(prev.map((msg) => msg.messageId));
      const merged = [...prev];
      incoming.forEach((msg) => {
        if (!seen.has(msg.messageId)) {
          merged.push(msg);
        }
      });
      return merged.slice(-MESSAGE_LIMIT);
    });
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const response = await chatService.listMessages({
        limit: MESSAGE_LIMIT,
        since: latestMessageTime,
      });

      if (!latestMessageTime) {
        setMessages(response);
      } else {
        mergeMessages(response);
      }
      setError(null);
    } catch (err) {
      console.error("[ChatPanel] Failed to load messages", err);
      setError("Unable to load chat. Trying again...");
    } finally {
      setLoading(false);
    }
  }, [latestMessageTime, mergeMessages]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!isMounted) return;
      await loadMessages();
    };

    void init();

    const interval = window.setInterval(() => {
      void loadMessages();
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (evt: React.FormEvent) => {
    evt.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    try {
      setSending(true);
      const sent = await chatService.postMessage({
        author: author.trim() || undefined,
        text: trimmed,
      });

      setMessages((prev) => [...prev, sent].slice(-MESSAGE_LIMIT));
      setText("");
      scrollToBottom();
      if (author.trim()) {
        localStorage.setItem(AUTHOR_STORAGE_KEY, author.trim());
      } else {
        localStorage.removeItem(AUTHOR_STORAGE_KEY);
      }
    } catch (err) {
      console.error("[ChatPanel] Failed to send message", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const isOverlay = variant === "overlay";

  const paperStyles = useMemo(
    () =>
      isOverlay
        ? {
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            backdropFilter: "blur(10px)",
            borderRadius: 2.5,
            color: theme.palette.getContrastText(isDark ? "#081223" : "#fdfdfd"),
            background: isDark ? "rgba(15,23,42,0.42)" : "rgba(255,255,255,0.62)",
            border: `1px solid ${isDark ? "rgba(248,250,252,0.1)" : "rgba(15,23,42,0.08)"}`,
            boxShadow: "0 18px 36px rgba(15,23,42,0.28)",
            maxHeight: "70vh",
            width: "100%",
          }
        : {
            p: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: isDark ? "rgba(20,24,34,0.8)" : "rgba(255,255,255,0.85)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)"}`,
            borderRadius: 3,
          },
    [isOverlay, isDark, theme.palette]
  );

  const listStyles = useMemo(
    () =>
      isOverlay
        ? {
            flexGrow: 1,
            overflowY: "auto",
            borderRadius: 2,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.12)"}`,
            p: 1.25,
            mb: 1.5,
            background: isDark ? "rgba(8,11,17,0.32)" : "rgba(248,250,252,0.45)",
          }
        : {
            flexGrow: 1,
            overflowY: "auto",
            borderRadius: 2,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"}`,
            p: 1.5,
            mb: 2,
            background: isDark ? "rgba(9,12,18,0.8)" : "rgba(248,250,252,0.7)",
          },
    [isOverlay, isDark]
  );

  return (
    <Paper elevation={isOverlay ? 6 : 0} sx={paperStyles}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: isOverlay ? 1 : 1.5,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Community Chat
        </Typography>
        {isOverlay && onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "inherit",
              backgroundColor: "rgba(15,23,42,0.12)",
              "&:hover": {
                backgroundColor: "rgba(15,23,42,0.24)",
              },
            }}
          >
            ×
          </IconButton>
        )}
      </Box>
      <Typography
        variant="body2"
        color={isOverlay ? "inherit" : "text.secondary"}
        sx={{ mb: isOverlay ? 1.5 : 2, opacity: isOverlay ? 0.8 : 1 }}
      >
        Share mission updates or tips with other operators in real-time. No login required.
      </Typography>

      <Box ref={listRef} sx={listStyles}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            No messages yet. Be the first to say hello!
          </Typography>
        ) : (
          messages.map((msg) => (
            <Box key={msg.messageId} sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                {msg.author ?? "Anonymous"} • {formatTimestamp(msg.createdAt)}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {msg.text}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: isOverlay ? 1 : 1 }}>
          {error}
        </Typography>
      )}

      <Box
        component="form"
        onSubmit={handleSend}
        sx={{ display: "flex", gap: 1, flexDirection: "column" }}
      >
        <Box sx={{ display: "flex", gap: 1, flexDirection: isOverlay ? "column" : "row" }}>
          <TextField
            label="Nickname (optional)"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            size="small"
            fullWidth
            sx={isOverlay ? undefined : { maxWidth: 220 }}
          />
          <TextField
            label="Message"
            value={text}
            onChange={(event) => setText(event.target.value)}
            size="small"
            multiline
            minRows={2}
            fullWidth
            required
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={sending || !text.trim()}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}


