import React from 'react';

const Cart: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
      <p className="text-gray-600">Review and checkout your selected books.</p>
      {/* Add a list of items in the cart and a checkout button */}
    </div>
  );
}

export default Cart;