import Image from "next/image";
import Link from "next/link";
import IntelliDocsPricing from "@/components/ui/intellidocs-pricing";

export const metadata = {
  title: "Pricing — intelliDocs",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-100 to-teal-100 flex flex-col">

      {/* Nav */}
      <div className="w-full px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
            <Image src="/Logo.svg" alt="intelliDocs" width={26} height={26} className="object-contain" />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">intelliDocs</span>
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          ← Back to app
        </Link>
      </div>

      {/* Pricing component */}
      <div className="flex-1">
        <IntelliDocsPricing />
      </div>

      {/* Footer */}
      <div className="border-t border-white/60 py-5 text-center text-xs text-gray-400 px-4">
        © {new Date().getFullYear()} intelliDocs.{" "}
        <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
        {" · "}
        <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
      </div>

    </div>
  );
}
