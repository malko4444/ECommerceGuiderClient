'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Admin from "../component/Admin";

function Page() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // Hit a protected endpoint — backend checks the HTTP-only cookie
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/verify`,
          { withCredentials: true }
        );
        setChecking(false);
      } catch (err) {
        // No cookie / invalid token → redirect to login
        router.replace("/admin/login");
      }
    };

    verifyAdmin();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4 font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  return <Admin />;
}

export default Page;