import { useCallback, useState } from 'react';
import { ChatMessage } from '../types/chat-message';

export function useMessageHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((message: ChatMessage) => {
    if (typeof message !== 'object' || message === null) return;
    if (!('type' in message)) return;
    if (!('payload' in message)) return;

    const type = message.type;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = message.payload;

    const types: Record<string, () => void> = {
      message: () => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: payload.text, username: payload.username },
        ]);
      },
      join: () => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `${payload.username} entrou na sala`,
            username: 'system',
          },
        ]);
      },
      leave: () => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `${payload.username} saiu da sala`,
            username: 'system',
          },
        ]);
      },
      error: () => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: payload.validation, username: 'system' },
        ]);
      },
    };

    if (typeof type === 'string' && type in types) {
      types[type]();
    }
  }, []);

  return { messages, addMessage };
}
