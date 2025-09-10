import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const ChatWindow = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // Real-time listener
  useEffect(() => {
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("roomId", "==", "global_admin_heads"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "messages"), {
      roomId: "global_admin_heads",
      senderId: currentUser.email,
      senderRole: currentUser.role,
      text: newMessage,
      timestamp: serverTimestamp(),
      readBy: [currentUser.email],
    });

    setNewMessage("");
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "80px",
      right: "20px",
      width: "400px",
      height: "500px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    }}>
      <h3 style={{ textAlign: "center" }}>Global Admin & Dept Heads Chat</h3>

      <div style={{ flex: 1, overflowY: "scroll", marginBottom: "10px" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: "8px" }}>
            <b>{msg.senderId}</b>: {msg.text}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 12px" }}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;