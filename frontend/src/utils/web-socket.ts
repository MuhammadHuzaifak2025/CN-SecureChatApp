// lib/websocket/websocket-service.ts
import { Message } from "@/lib/types";

type MessageCallback = (message: Message) => void;
type OnlineStatusCallback = (username: string, isOnline: boolean) => void;
type DeliveryReceiptCallback = (messageId: number, serializedMessage: Message) => void;
type ChatHistoryCallback = (messages: Message[]) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private onlineStatusCallbacks: OnlineStatusCallback[] = [];
  private deliveryReceiptCallbacks: DeliveryReceiptCallback[] = [];
  private chatHistoryCallbacks: ChatHistoryCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private username: string = "";
  private accessToken: string = "";

  connect(username: string, accessToken: string) {
    this.username = username;
    this.accessToken = accessToken;
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    // Connect to the WebSocket server with the access token
    // Here we use query parameters, but the WebSocket protocol should handle authentication
    // securely according to your backend requirements
    this.socket = new WebSocket(`ws://localhost:8000/chat/${username}/?token=${accessToken}`);

    this.socket.onopen = () => {
      console.log("WebSocket connection established");
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);

      switch (data.type) {
        case "chat_message":
          this.messageCallbacks.forEach((callback) => callback(data.message));
          // Send delivery receipt back
          this.sendDeliveryReceipt(data.message.id);
          break;
        case "online-acknowledge":
          const onlineUsername = data.sender;
          this.onlineStatusCallbacks.forEach((callback) => 
            callback(onlineUsername, true)
          );
          break;
        case "offline-notification":
          const offlineUsername = data.sender;
          this.onlineStatusCallbacks.forEach((callback) => 
            callback(offlineUsername, false)
          );
          break;
        case "delivery-receipt":
          this.deliveryReceiptCallbacks.forEach((callback) => 
            callback(data.message_id, data.serialized_message)
          );
          break;
        case "chat_history":
          this.chatHistoryCallbacks.forEach((callback) => 
            callback(data.messages)
          );
          break;
      }
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket connection closed", event);

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(this.username, this.accessToken);
        }, 2000 * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
      } else {
        console.error("Max reconnect attempts reached");
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  sendMessage(message: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  sendDeliveryReceipt(messageId: number) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ 
        type: "delivery-receipt", 
        message_id: messageId 
      }));
    }
  }

  sendTypingIndicator(isTyping: boolean) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ 
        type: "typing-indicator", 
        is_typing: isTyping 
      }));
    }
  }

  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onOnlineStatus(callback: OnlineStatusCallback) {
    this.onlineStatusCallbacks.push(callback);
    return () => {
      this.onlineStatusCallbacks = this.onlineStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  onDeliveryReceipt(callback: DeliveryReceiptCallback) {
    this.deliveryReceiptCallbacks.push(callback);
    return () => {
      this.deliveryReceiptCallbacks = this.deliveryReceiptCallbacks.filter(cb => cb !== callback);
    };
  }

  onChatHistory(callback: ChatHistoryCallback) {
    this.chatHistoryCallbacks.push(callback);
    return () => {
      this.chatHistoryCallbacks = this.chatHistoryCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Export as singleton
export const webSocketService = new WebSocketService();