import './style.css';
import { ws } from './websocket-client.ts';

type ChatMessage = {
  username: string;
  text: string;
};

function stateHolder<T>(initial: T) {
  let state = initial;

  return {
    get: () => state,
    set: (next: T) => {
      state = next;
    },
  };
}

const username = stateHolder('Anonymous');

function usernameForm() {
  const container = document.createElement('form', {});
  container.addEventListener('submit', (ev) => {
    ev.preventDefault();

    if (ev.target instanceof HTMLFormElement) {
      username.set(ev.target.username.value);
    }

    return false;
  });

  container.innerHTML = `
    <input type="text" name="username" placeholder="Username" />
    <button type="submit">Set</button>
  `;

  return container;
}

function chatMessage(props: ChatMessage) {
  const container = document.createElement('div', {});

  container.innerHTML = `
    <strong>${props.username}</strong>
    <p>${props.text}</p>
  `;

  return container;
}

function sendChatMessage(message: ChatMessage) {
  ws.send(
    JSON.stringify({
      type: 'message',
      payload: message,
    })
  );
}

function chatMessages() {
  const container = document.createElement('div', {});
  console.log('rodo');

  ws.addEventListener('message', (ev) => {
    const data = JSON.parse(ev.data);

    console.log(data);

    if (data.type === 'message') {
      container.appendChild(chatMessage(data.payload));
    }
  });

  return container;
}

function chatForm() {
  const container = document.createElement('form', {});

  const usernameValue = username.get();

  container.addEventListener('submit', (ev) => {
    ev.preventDefault();

    if (ev.target instanceof HTMLFormElement) {
      const text = ev.target.text.value;

      sendChatMessage({ username: usernameValue, text });
      ev.target.reset();
    }

    return false;
  });

  container.innerHTML = `
    <input type="text" name="text" placeholder="Message" />
    <button type="submit">Send</button>
  `;

  return container;
}

function app() {
  const container = document.createElement('div');

  container.appendChild(usernameForm());
  container.appendChild(chatMessages());
  container.appendChild(chatForm());

  return container;
}

document.querySelector<HTMLDivElement>('#app')?.appendChild(app());
