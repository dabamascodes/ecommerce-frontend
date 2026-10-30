import { LoginPage } from './pages/auth/LoginPage';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <div>
      {isAuthenticated ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
          <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-200 max-w-md">
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              ¡Conexión Exitosa! 🎉
            </h1>
            <p className="text-gray-600 mb-6">
              El JWT fue almacenado y la sesión está activa.
            </p>

            {user && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left text-sm text-gray-700">
                <p><strong>Usuario:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
              </div>
            )}

            <button
              onClick={logout}
              className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App;