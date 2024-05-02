import { useEffect, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { useWS } from '../hooks/use-ws';
import { ChatMessage } from '../types/chat-message';
import { ChatMessageBubble } from './chat-message-bubble';
import { LoadingSpinner } from './loading-spinner';

export function ChatMessages() {
  const { messages, readyState } = useChatMessages();

  if (readyState === ReadyState.CONNECTING) {
    return <LoadingSpinner />;
  }

  if (readyState !== ReadyState.OPEN) {
    return (
      <div className="flex items-center justify-center w-full h-full text-cat-red">
        Algo deu errado
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
      {messages.map((message) => (
        <ChatMessageBubble
          key={message.text + message.username}
          text={message.text}
          username={message.username}
        />
      ))}
    </div>
  );
}

function useChatMessages() {
  const { readyState, lastMessage } = useWS();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  console.log('lastMessage', lastMessage);

  useEffect(() => {
    if (lastMessage === null) return undefined;

    try {
      const message = JSON.parse(lastMessage.data);

      if (message.type === 'message') {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: message.payload.text, username: message.payload.username },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [lastMessage]);

  return { readyState, messages };
}
