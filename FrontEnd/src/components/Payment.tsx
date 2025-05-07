import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Wallet, CheckCircle } from 'lucide-react';

interface PaymentProps {
  book_id: number|null;
  bookTitle: string;
  price: number;
  onPaymentSuccess: () => void;
}

const Payment: React.FC<PaymentProps> = ({ book_id, bookTitle, price, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const userId = sessionStorage.getItem('userID');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const response = await fetch('http://localhost:5001/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          payment_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          method: paymentMethod,
          book_id: book_id,
          amount: price
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Payment successful
      setPaymentSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-6">You can now download your book.</p>
        <div className="animate-pulse text-blue-500">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Purchase</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-1">You're purchasing:</p>
        <p className="font-semibold text-lg">{bookTitle}</p>
        <p className="text-gray-600 mt-2">Total: <span className="font-bold text-blue-600">${price.toFixed(2)}</span></p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Payment Method</h3>
        <div className="space-y-3">
          <button
            onClick={() => setPaymentMethod('credit')}
            className={`w-full flex items-center p-4 border rounded-lg ${paymentMethod === 'credit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
          >
            <CreditCard className="w-5 h-5 mr-3 text-blue-500" />
            <span>Credit Card</span>
          </button>
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`w-full flex items-center p-4 border rounded-lg ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
          >
            <Wallet className="w-5 h-5 mr-3 text-blue-500" />
            <span>PayPal</span>
          </button>
          <button
            onClick={() => setPaymentMethod('bank')}
            className={`w-full flex items-center p-4 border rounded-lg ${paymentMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
          >
            <Banknote className="w-5 h-5 mr-3 text-blue-500" />
            <span>Bank Transfer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing || !paymentMethod}
        className={`w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition ${isProcessing || !paymentMethod ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
      </button>

      <button
        onClick={() => navigate(-1)}
        className="w-full mt-3 py-2 px-6 text-gray-600 hover:text-gray-800 font-medium"
      >
        Cancel
      </button>
    </div>
  );
};

export default Payment;