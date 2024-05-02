import { useRef } from 'react';
import { ArrowRight } from 'solar-icon-set';
import { useAppConfig } from '../contexts/app-config';
import { useWS } from '../hooks/use-ws';

export function ChatInput() {
  const formRef = useRef<HTMLFormElement>(null);
  const { sendMessage } = useChatInput();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const message = data.get('message');
    if (typeof message !== 'string') return;
    sendMessage(message);
    formRef.current.reset();
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleFormSubmit}
      className="flex gap-2 items-center justify-center w-full p-4 bg-cat-mantle rounded-b-3xl mt-auto"
    >
      <input
        className="w-full p-2 bg-cat-base text-cat-subtext0 rounded-3xl border border-cat-lavender"
        name="message"
        type="text"
      />
      <button className="px-3 py-2 flex items-center justify-center gap-2 bg-cat-maroon text-cat-base rounded-2xl">
        Enviar <ArrowRight size={20} iconStyle="Bold" />
      </button>
    </form>
  );
}

function useChatInput() {
  const { sendJsonMessage } = useWS();
  const { username } = useAppConfig();
  const sendMessage = (text: string) => {
    sendJsonMessage({
      type: 'message',
      payload: { username, text },
    });
  };

  return { sendMessage };
}
