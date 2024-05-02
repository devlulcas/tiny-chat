import { useEffect } from 'react';
import { ReadyState } from 'react-use-websocket';
import { useMessageHistory } from '../hooks/use-message-history';
import { useWS } from '../hooks/use-ws';
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
  const { messages, addMessage } = useMessageHistory();

  useEffect(() => {
    if (lastMessage === null) return undefined;

    try {
      const message = JSON.parse(lastMessage.data);
      addMessage(message);
    } catch (error) {
      console.error(error);
    }
  }, [addMessage, lastMessage]);

  return { readyState, messages };
}
