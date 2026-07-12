import Link from "next/link";

export function Footer({
  brandName = "Creamy",
  address = "",
  phone = "",
  email = "",
  hours = "",
  instagram = "#",
  facebook = "#",
  twitter = "#",
}: {
  brandName?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}) {
  const addressLines = address.split("\n").filter(Boolean);
  const hoursLines = hours.split("\n").filter(Boolean);
  return (
    <footer id="contact" className="relative bg-flavor-green text-white">
      {/* Wavy top divider */}
      <svg
        className="absolute -top-1 left-0 w-full text-flavor-green"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        style={{ transform: "translateY(-98%)" }}
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,60 C240,10 480,100 720,60 C960,20 1200,100 1440,60 L1440,100 L0,100 Z"
        />
      </svg>

      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 md:px-12">
        <h3 className="font-heading text-5xl font-bold">{brandName}</h3>

        <div className="mt-10 grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
          <div>
            <div className="mb-3 font-semibold">Address</div>
            <p className="leading-relaxed text-white/80">
              {addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < addressLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            {phone ? <p className="mt-2 text-white/80">{phone}</p> : null}
            {email ? <p className="text-white/80">{email}</p> : null}
          </div>
          <div>
            <div className="mb-3 font-semibold">Opening hours</div>
            {hoursLines.map((line, i) => (
              <p key={i} className="text-white/80">
                {line}
              </p>
            ))}
          </div>
          <div>
            <div className="mb-3 font-semibold">Quick links</div>
            <ul className="space-y-1 text-white/80">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white">
                  My account
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white">
                  Order Online
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-3 font-semibold">Social Media</div>
            <ul className="space-y-1 text-white/80">
              <li>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-6 text-center text-xs text-white/70">
          &copy; {new Date().getFullYear()} {brandName}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
