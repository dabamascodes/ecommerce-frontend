import { LoginPage } from './pages/auth/LoginPage';
import { HomePage } from './pages/home/HomePage';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <main>
      {isAuthenticated ? <HomePage /> : <LoginPage />}
    </main>
  );
}

export default App;