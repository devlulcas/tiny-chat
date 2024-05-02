import { Cat } from 'solar-icon-set';
import { useAppConfig } from '../contexts/app-config';
import { useWS } from '../hooks/use-ws';
import { CurrentStateIndicator } from './current-state-indicator';

export function ChatWindowHeader() {
  const { username, setUsername } = useAppConfig();

  const { sendJsonMessage } = useWS();

  const clearUsername = () => {
    sendJsonMessage({ type: 'leave', payload: { username } });
    setUsername('');
  };

  return (
    <header className="flex items-center justify-center w-full p-4 bg-cat-mantle rounded-t-3xl">
      <CurrentStateIndicator />

      <h1 className="text-2xl font-bold text-cat-lavender">
        Hello, {username}!
      </h1>

      <button
        onClick={clearUsername}
        className="ml-auto items-center flex gap-2 px-3 py-2 bg-cat-maroon text-cat-base rounded-2xl"
      >
        Sair
        <Cat size={20} iconStyle="Bold" />
      </button>
    </header>
  );
}
