import { useEffect, useRef } from 'react';
import { useAppConfig } from '../contexts/app-config';
import { useWS } from '../hooks/use-ws';

export function UsernameDialogForm() {
  const { username, setUsername } = useAppConfig();
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
