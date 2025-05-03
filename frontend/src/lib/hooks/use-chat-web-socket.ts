// lib/hooks/useChatWebSocket.ts
import { useState, useEffect } from "react";
import { webSocketService } from "@/utils/web-socket";
import { Message, User } from "@/lib/types";

export function useChatWebSocket(receiverUsername: string, currentUser: User, accessToken: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isReceiverOnline, setIsReceiverOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.username || !accessToken) return;

    // Connect to WebSocket with the access token
    webSocketService.connect(currentUser.username, accessToken);
    setIsConnected(true);

    // Handle incoming messages
    const messageUnsubscribe = webSocketService.onMessage((message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    // Handle online status updates
    const onlineStatusUnsubscribe = webSocketService.onOnlineStatus((username, status) => {
      if (username === receiverUsername) {
        setIsReceiverOnline(status);
      }
    });

    // Handle delivery receipts
    const deliveryReceiptUnsubscribe = webSocketService.onDeliveryReceipt((messageId, updatedMessage) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, is_delivered: true } : message
        )
      );
    });

    // Handle chat history
    const chatHistoryUnsubscribe = webSocketService.onChatHistory((historyMessages) => {
      setMessages(historyMessages);
      setIsLoading(false);
    });

    return () => {
      messageUnsubscribe();
      onlineStatusUnsubscribe();
      deliveryReceiptUnsubscribe();
      chatHistoryUnsubscribe();
      webSocketService.disconnect();
      setIsConnected(false);
    };
  }, [currentUser?.username, receiverUsername, accessToken]);

  const sendMessage = (content: string) => {
    if (!isConnected) return false;
    webSocketService.sendMessage(content);
    return true;
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!isConnected) return;
    webSocketService.sendTypingIndicator(isTyping);
  };

  return {
    messages,
    isConnected,
    isReceiverOnline,
    isLoading,
    sendMessage,
    sendTypingIndicator,
  };
}