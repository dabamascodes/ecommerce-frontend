import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppRouter } from './routes';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;