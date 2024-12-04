import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Mail, Phone, MessageSquare } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I create an account?",
    answer: "To create an account, click on the 'Sign Up' button in the top right corner of the homepage. Fill in your details and follow the prompts to complete the registration process."
  },
  {
    question: "How can I add a book to my wishlist?",
    answer: "To add a book to your wishlist, navigate to the book's page and click on the 'Add to Wishlist' button. You can view your wishlist by clicking on the 'Wishlist' option in the sidebar."
  },
  {
    question: "How do I download an ebook?",
    answer: "After purchasing an ebook, go to your library and find the book. Click on the 'Download' button next to the book title. The ebook will be downloaded in the format you chose during purchase."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including credit/debit cards, PayPal, and gift cards. You can view all available payment options during the checkout process."
  },
  {
    question: "How can I return a book?",
    answer: "If you're not satisfied with your purchase, you can return physical books within 30 days of delivery. For ebooks, we offer a 14-day return policy. Please contact our customer support for assistance with returns."
  },
];

const FAQItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-900">{item.question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 pr-4">
          <p className="text-gray-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
};

const Help: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <HelpCircle className="h-8 w-8 text-teal-500 mr-2" />
        <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <FAQItem key={index} item={faq} />
              ))}
            </div>
          </div>
    
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">If you have additional questions, feel free to reach out to us:</p>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-teal-500 mr-2" />
                <span className="text-gray-800">Email: support@online-bookstore.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-teal-500 mr-2" />
                <span className="text-gray-800">Phone: +1 (123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <MessageSquare className="h-5 w-5 text-teal-500 mr-2" />
                <span className="text-gray-800">Live Chat: Available 24/7</span>
              </li>
            </ul>
          </div>
        </div>
      );
    };
    
    export default Help;
    