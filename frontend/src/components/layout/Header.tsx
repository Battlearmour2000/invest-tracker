import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          Investment Tracker
        </Link>
        <nav className="flex space-x-4">
          <Link to="/" className="text-gray-600 hover:text-indigo-600">
            Dashboard
          </Link>
          <button className="text-gray-600 hover:text-indigo-600">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}