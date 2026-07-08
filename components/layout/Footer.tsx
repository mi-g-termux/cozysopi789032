import Link from "next/link";
import { Wave } from "@/components/ui/Wave";

export function Footer() {
  return (
    <footer className="mt-24">
      <Wave color="#3F8B43" />
      <div className="bg-grass text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-heading text-3xl font-bold">Creamy</h3>
            <p className="mt-3 text-sm text-white/80">
              Handcrafted ice cream made with real fruits and fresh dairy,
              delivered to your door.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-heading text-lg">Address</h4>
            <ul className="space-y-1 text-sm text-white/80">
              <li>12 Sundae Street</li>
              <li>Scoop District</li>
              <li>hello@creamy.shop</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-heading text-lg">Opening Hours</h4>
            <ul className="space-y-1 text-sm text-white/80">
              <li>Mon – Fri: 10am – 9pm</li>
              <li>Sat – Sun: 9am – 11pm</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-heading text-lg">Quick Links</h4>
            <ul className="space-y-1 text-sm text-white/80">
              <li>
                <Link href="/shop" className="hover:text-white">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white">
                  My account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 py-5 text-center text-xs text-white/70">
          &copy; {new Date().getFullYear()} Creamy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
