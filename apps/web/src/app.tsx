import { ChatWindow } from './components/chat-window';
import { UsernameDialogForm } from './components/username-dialog-form';
import { AppConfigProvider } from './contexts/app-config';

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
