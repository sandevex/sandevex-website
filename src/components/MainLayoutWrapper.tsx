"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBypassed = pathname.startsWith("/admin") || pathname === "/login";

  if (isBypassed) {
    return <div className="flex-1 flex flex-col min-h-screen">{children}</div>;
  }

  return (
    <>
      <Header />
      <div className="flex-1 pt-20 flex flex-col">{children}</div>
      <Footer />
    </>
  );
}
