import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { ChatWindowHeader } from './chat-window-header';

export function ChatWindow() {
  return (
    <main className="bg-cat-base flex flex-col z-10 w-full h-full max-w-xl max-h-[90dvh] rounded-3xl border border-l-cat-mantle shadow-lg">
      <ChatWindowHeader />
      <ChatMessages />
      <ChatInput />
    </main>
  );
}
