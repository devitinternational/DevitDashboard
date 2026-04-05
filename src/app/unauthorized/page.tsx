import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-700 mb-4">403</p>
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">You don&apos;t have permission to access this page.</p>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}