import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useCartStore, useAddressStore } from '../../store';
import { authService } from '../../services';
import { toast } from 'sonner';

export const SinglePageOnboarding: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [street, setStreet] = useState('');
  const [exteriorNumber, setExteriorNumber] = useState('');
  const [interiorNumber, setInteriorNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const isDefault = true;

  const navigate = useNavigate();
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const closeCart = useCartStore((state: any) => state.closeCart);
  const createAddress = useAddressStore((state: any) => state.createAddress);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
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

      if (token && userData) {
        setAuth(userData, token);
      }

      closeCart();
      toast.success('Account created successfully! Please add your shipping address.');
      
      setStep(2);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createAddress({
        street,
        exteriorNumber,
        interiorNumber: interiorNumber ? interiorNumber : undefined,
        neighborhood,
        city,
        state,
        zipCode,
        country,
        phone,
        isDefault,
      } as any);

      toast.success('Welcome! Your onboarding is complete.');
      navigate('/products', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-md border border-gray-200">
        
        <div className="flex items-center justify-center mb-6 space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
        </div>

        {step === 1 ? (
          <>
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
              Create an Account
            </h2>
            <p className="text-center text-sm text-gray-600 mb-6">
              Step 1 of 2: Enter your personal details
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Continue to Address'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline font-semibold">
                Log in here
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
              Shipping Address
            </h2>
            <p className="text-center text-sm text-gray-600 mb-6">
              Step 2 of 2: Where should we send your orders?
            </p>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="W 34th St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exterior Number</label>
                  <input
                    type="text"
                    required
                    value={exteriorNumber}
                    onChange={(e) => setExteriorNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="350"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interior Number (Opt.)</label>
                  <input
                    type="text"
                    value={interiorNumber}
                    onChange={(e) => setInteriorNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Suite 400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Neighborhood / Colony</label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Midtown"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code (5 digits)</label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="United States"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Complete Registration & Shop'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};