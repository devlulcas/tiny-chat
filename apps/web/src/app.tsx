import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useWebSocket from 'react-use-websocket';
import { ArrowRight, Cat } from 'solar-icon-set';

const WS_URL = 'ws://localhost:8000/ws';

const useWS = () => useWebSocket(WS_URL);

const AppConfigContext = createContext({
  username: '',
  setUsername: (name: string) => {
    console.error(`setUserName not implemented - cannot set ${name}`);
  },
});

function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useLocalStorage<string>('username', '');

  return (
    <AppConfigContext.Provider value={{ username, setUsername }}>
      {children}
    </AppConfigContext.Provider>
  );
}

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };

  return [storedValue, setValue];
}

export function App() {
  return (
    <AppConfigProvider>
      <UsernameDialogForm />
      <div
        className="font-sans antialiased min-h-screen w-screen overflow-hidden grid place-items-center"
        style={{
          background: '#8839ef',
          backgroundImage: 'radial-gradient(circle, #8839ef 0%, #7287fd 100%)',
        }}
      >
        <div
          className="w-full h-full absolute inset-0 text-cat-flamingo"
          style={{ backgroundImage: 'url(/cat.svg)' }}
        />

        <ChatWindow />
      </div>
    </AppConfigProvider>
  );
}

function UsernameDialogForm() {
  const { username, setUsername } = useContext(AppConfigContext);
  const modalRef = useRef<HTMLDialogElement>(null);

  const { sendJsonMessage } = useWS();

  const saveUsername = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = form.elements.namedItem('username') as HTMLInputElement;
    setUsername(username.value);

    sendJsonMessage({
      type: 'join',
      payload: { username: username.value },
    });

    modalRef.current?.close();
  };

  useEffect(() => {
    if (!username) {
      modalRef.current?.showModal();
    }
  }, [username]);

  return (
    <dialog
      className="bg-cat-base rounded-3xl shadow-lg backdrop:bg-cat-mauve/50 backdrop:backdrop-blur-md"
      ref={modalRef}
    >
      <form
        onSubmit={saveUsername}
        className="flex flex-col items-center justify-center w-96 h-96 p-4"
        action="/"
      >
        <strong className="text-2xl text-center text-cat-peach font-black mb-8">
          Bem vindo ao Tiny Chat!
        </strong>

        <div>
          <label className="text-cat-subtext0" htmlFor="username">
            Digite seu nome de usuário
          </label>
          <input
            className="w-full p-2 mt-2 bg-white text-cat-subtext0 rounded-md"
            type="text"
            id="username"
          />
        </div>
        <button
          className="mt-4 p-2 bg-cat-maroon text-cat-base rounded-md w-full"
          type="submit"
        >
          Salvar
        </button>
      </form>
    </dialog>
  );
}

function ChatWindowHeader() {
  const { username, setUsername } = useContext(AppConfigContext);

  const { sendJsonMessage } = useWS();

  const clearUsername = () => {
    sendJsonMessage({ type: 'leave', payload: { username } });
    setUsername('');
  };
  return (
    <header className="flex items-center justify-center w-full p-4 bg-cat-mantle rounded-t-3xl">
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

function createRandomPastelColorForString(str: string) {
  const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);

  return `hsl(${hash % 360}, 50%, 80%)`;
}

function ChatMessage({
  message,
  username,
}: {
  message: string;
  username: string;
}) {
  const color = useMemo(
    () => createRandomPastelColorForString(username),
    [username]
  );

  return (
    <div className="flex items-center gap-2 p-2">
      <div className="w-8 h-8 rounded-full" style={{ background: color }}></div>
      <p className="text-cat-subtext0">{username}</p>
      <p className="text-cat-subtext0">{message}</p>
    </div>
  );
}

function ChatMessages() {
  const { getWebSocket } = useWS();
  const [messages, setMessages] = useState<string[]>([]);

  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    socket.current = getWebSocket();

    return () => {
      socket.current?.close();
    };
  }, [getWebSocket]);

  useEffect(() => {
    console.log('Setting up message listener');
    if (!socket.current) return;

    console.log('Setting up message listener');
    socket.current.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);

        console.log('Received message:', type, payload);

        if (type === 'message') {
          setMessages((prev) => [...prev, payload.text]);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }, [socket]);

  return (
    <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} username="User" />
      ))}
    </div>
  );
}

function ChatInput() {
  const { sendJsonMessage } = useWS();
  const { username } = useContext(AppConfigContext);
  const formRef = useRef<HTMLFormElement>(null);

  const sendMessage = (text: string) => {
    sendJsonMessage({
      type: 'message',
      payload: { username, text },
    });
  };

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

function ChatWindow() {
  return (
    <main className="bg-cat-base flex flex-col z-10 w-full h-full max-w-xl max-h-[90dvh] rounded-3xl border border-l-cat-mantle shadow-lg">
      <ChatWindowHeader />
      <ChatMessages />
      <ChatInput />
    </main>
  );
}
