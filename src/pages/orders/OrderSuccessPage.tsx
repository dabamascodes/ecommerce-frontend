import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package } from 'lucide-react';

export const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId?: string }>();

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you for your purchase!</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your payment has been successfully verified and your order is now being processed.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left border border-gray-100 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Order ID:</span>
              <span className="font-mono text-gray-800 font-medium truncate max-w-50" title={orderId}>
                {orderId}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Payment Status:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                PAID
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/orders"
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Package className="w-4 h-4 mr-2" />
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};