// GlobalChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, IconButton, Paper, Badge } from "@mui/material";
import { Send as SendIcon, Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function GlobalChat({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef();

  // Listen for real-time chat updates
  useEffect(() => {
    const q = query(collection(db, "globalChats"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, "globalChats"), {
        senderId: user?.id || "unknown",
        senderName: user?.name || "Anonymous",
        message: input.trim(),
        timestamp: serverTimestamp(),
      });
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={() => setOpen(prev => !prev)}
          color="primary"
          sx={{ bgcolor: "#6b8e47", "&:hover": { bgcolor: "#486c2c" }, color: "white" }}
        >
          <Badge badgeContent={0} color="error">
            {open ? <CloseIcon /> : <ChatIcon />}
          </Badge>
        </IconButton>
      </Box>

      {/* Chat Window */}
      {open && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 70,
            right: 20,
            width: 300,
            height: 400,
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          <Box sx={{ bgcolor: "#6b8e47", color: "white", p: 1, fontWeight: 600 }}>
            Global Chat
          </Box>
          <Box sx={{ flex: 1, p: 1, overflowY: "auto" }}>
            {messages.map(msg => (
              <Box key={msg.id} sx={{ mb: 1 }}>
                <Typography variant="caption" color="textSecondary">{msg.senderName}:</Typography>
                <Typography>{msg.message}</Typography>
              </Box>
            ))}
            <div ref={messagesEndRef}></div>
          </Box>
          <Box sx={{ display: "flex", p: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              fullWidth
            />
            <IconButton onClick={handleSend} color="primary">
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}