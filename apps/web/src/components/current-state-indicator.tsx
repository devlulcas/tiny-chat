import { ReadyState } from 'react-use-websocket';
import { useWS } from '../hooks/use-ws';

export function CurrentStateIndicator() {
  const { readyState } = useWS();

  const state = {
    [ReadyState.CLOSED]: {
      text: 'Fechado',
      color: 'bg-red-500',
    },
    [ReadyState.CLOSING]: {
      text: 'Fechando',
      color: 'bg-yellow-500',
    },
    [ReadyState.CONNECTING]: {
      text: 'Conectando',
      color: 'bg-yellow-500',
    },
    [ReadyState.OPEN]: {
      text: 'Aberto',
      color: 'bg-green-500',
    },
    [ReadyState.UNINSTANTIATED]: {
      text: 'Não instanciado',
      color: 'bg-gray-500',
    },
  }[readyState];

  return (
    <span
      className={`absolute top-[-1px] left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-bold text-white rounded-b-lg ${state.color}`}
    >
      {state.text}
    </span>
  );
}
