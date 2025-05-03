
export interface User {
  id: string | number;
  username: string;
  fullname?: string;
  avatar?: string;
  isOnline?: boolean;
  email: string;
}

export interface Message {
  id: number;
  sender: string | User;
  content: string;
  timestamp: string;
  is_read: boolean;
  is_delivered: boolean;
  chat_room: number;
}

export interface TypingIndicator {
  user: User;
  is_typing: boolean;
}

export interface ChatRoom {
  id: number;
  name: string;
  is_group: boolean;
  members?: User[];
}