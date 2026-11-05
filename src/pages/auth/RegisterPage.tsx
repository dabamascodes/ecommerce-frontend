import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../../store';
import { authService } from '../../services';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const closeCart = useCartStore((state) => state.closeCart);

  const fromCheckout = 
    (location.state as any)?.fromCheckout || 
    localStorage.getItem('fromCheckout') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.register({ name, lastName, phone, email, password });
      
      const token = response?.token;
      const userData = response?.user || { 
        id: response?.id, 
        email: response?.email, 
        name: response?.name, 
        lastName: response?.lastName, 
        roles: response?.roles 
      };

      if (token) {
        localStorage.setItem('token', token);
      }

      if (userData && token) {
        setAuth(userData, token);
      }

      closeCart();

      const shouldGoToCheckout = localStorage.getItem('fromCheckout') === 'true';

      if (shouldGoToCheckout) {
        window.location.replace('/checkout/address');
        return;
      }

      navigate('/products', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
          Create an Account
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          {fromCheckout ? 'Sign up to complete your purchase' : 'Enter your details to get started'}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="+1 (555) 019-2834"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must have uppercase, lowercase and a number (min. 6 chars).
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register & Continue'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-semibold">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};