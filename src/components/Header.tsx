"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-800">PM Navigator</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/waterfall"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              ウォーターフォール
            </Link>
            <Link
              href="/agile"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              アジャイル
            </Link>
            <button
              onClick={logout}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              ログアウト
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
