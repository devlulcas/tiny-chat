import { useMemo } from 'react';
import { createRandomPastelColorForString } from '../libs/create-pastel-color-for-string';
import { ChatMessage } from '../types/chat-message';

export function ChatMessageBubble({ text, username }: ChatMessage) {
  const color = useMemo(
    () => createRandomPastelColorForString(username),
    [username]
  );

  return (
    <div className="flex items-center gap-2 p-2">
      <div className="w-8 h-8 rounded-full" style={{ background: color }}></div>
      <p className="text-cat-subtext0">{username}</p>
      <p className="text-cat-subtext0">{text}</p>
    </div>
  );
}
