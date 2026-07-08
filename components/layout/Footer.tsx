import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-secondary/50 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <h3 className="font-heading text-xl text-accent">Cozy Bites</h3>
          <p className="mt-2 text-sm text-ink/70">
            Handcrafted appetizers &amp; boards, delivered warm to your door.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Shop</h4>
          <ul className="space-y-1 text-sm text-ink/70">
            <li><Link href="/shop" className="hover:text-accent">All products</Link></li>
            <li><Link href="/cart" className="hover:text-accent">Cart</Link></li>
            <li><Link href="/account" className="hover:text-accent">My account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Help</h4>
          <ul className="space-y-1 text-sm text-ink/70">
            <li><Link href="/login" className="hover:text-accent">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-accent">Create account</Link></li>
            <li><Link href="/forgot-password" className="hover:text-accent">Reset password</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-secondary/50 py-4 text-center text-xs text-ink/50">
        &copy; {new Date().getFullYear()} Cozy Bites. All rights reserved.
      </div>
    </footer>
  );
}
