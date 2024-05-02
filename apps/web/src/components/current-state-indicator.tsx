import { ReadyState } from 'react-use-websocket';
import { useWS } from '../hooks/use-ws';

export function CurrentStateIndicator() {
  const { readyState } = useWS();

  const state = {
    [ReadyState.CLOSED]: 'Fechado',
    [ReadyState.CLOSING]: 'Fechando',
    [ReadyState.CONNECTING]: 'Conectando',
    [ReadyState.OPEN]: 'Aberto',
    [ReadyState.UNINSTANTIATED]: 'Não instanciado',
  }[readyState];

  return <div className="text-sm text-gray-500">Estado atual: {state}</div>;
}
