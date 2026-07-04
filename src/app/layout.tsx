import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Music2, Send, Twitch, UserRound, Youtube } from "lucide-react";
import { CartNavLink } from "@/components/CartNavLink";
import { ItemIcon } from "@/components/ItemIcon";
import { MobileMenu } from "@/components/MobileMenu";
import { creatorInfo } from "@/lib/creator";
import { formatTalers } from "@/lib/currency";
import { siteInfo } from "@/lib/site";
import { getCurrentUser } from "@/lib/user-auth";
import "./globals.css";

function getMetadataBase() {
  try {
    return new URL(process.env.APP_URL || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: siteInfo.name,
  description: siteInfo.description,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: siteInfo.icon, sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: siteInfo.icon, sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: siteInfo.name,
    description: siteInfo.description,
    images: [siteInfo.icon],
    locale: "uk_UA",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteInfo.name,
    description: siteInfo.description,
    images: [siteInfo.icon]
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="uk">
      <body>
        <header className="sticky top-0 z-40 border-b border-white/10 bg-bunker/90 backdrop-blur-xl">
          <nav className="shell flex min-h-16 items-center justify-between gap-4 py-3">
            <Link href="/" className="group flex items-center gap-3">
              <span className="item-cube grid h-11 w-11 overflow-hidden border border-moss/40 bg-black/35 shadow-glow transition group-hover:border-acid">
                <ItemIcon kind="shulker_box" size="sm" />
              </span>
              <span>
                <span className="block text-sm font-black uppercase tracking-wide text-white sm:text-base">
                  {siteInfo.name}
                </span>
                <span className="block text-xs text-fog/60">{siteInfo.tagline}</span>
              </span>
            </Link>
            <div className="hidden flex-wrap justify-end gap-1 text-sm font-bold text-fog/75 sm:gap-2 lg:flex">
              <Link className="rounded-sm px-3 py-2 transition hover:bg-white/10 hover:text-white" href="/shop">
                Магазин
              </Link>
              <Link className="rounded-sm px-3 py-2 transition hover:bg-white/10 hover:text-white" href="/faq">
                FAQ
              </Link>
              <Link className="rounded-sm border border-gold/30 bg-gold/10 px-3 py-2 text-gold transition hover:bg-gold/20" href="/shop#gods">
                Суперпредмети
              </Link>
              <CartNavLink />
              {user ? (
                <Link
                  className="inline-flex items-center gap-2 rounded-sm border border-gold/25 bg-gold/10 px-3 py-2 text-gold transition hover:bg-gold/20"
                  href="/top-up"
                >
                  <ItemIcon kind="gold_ingot" size="xs" />
                  {formatTalers(user.balance)}
                </Link>
              ) : null}
              <Link
                className="inline-flex items-center gap-2 rounded-sm border border-moss/25 bg-moss/10 px-3 py-2 text-moss transition hover:bg-moss/20 hover:text-acid"
                href={user ? "/account" : "/login"}
              >
                <UserRound size={15} />
                {user ? user.minecraftNickname : "Увійти"}
              </Link>
            </div>
            <MobileMenu
              user={
                user
                  ? {
                      minecraftNickname: user.minecraftNickname,
                      balance: user.balance
                    }
                  : null
              }
            />
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-white/10 bg-black/30">
          <div className="shell grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="item-cube grid h-10 w-10 overflow-hidden border border-moss/30 bg-black/35">
                  <ItemIcon kind="shulker_box" size="sm" />
                </span>
                <div>
                  <p className="font-black uppercase tracking-wide text-white">{siteInfo.name}</p>
                  <p className="text-sm text-fog/56">Ресурси, набори й корисні предмети за талери.</p>
                </div>
              </div>
              <p className="mt-5 max-w-xl text-xs font-semibold uppercase leading-6 text-fog/50">
                NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR
                MICROSOFT.
              </p>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-wide text-moss">Спільнота</p>
              <div className="mt-4 grid gap-3 text-sm text-fog/70">
                <a className="inline-flex items-center gap-2 transition hover:text-white" href={siteInfo.discordUrl} target="_blank" rel="noreferrer">
                  <MessageCircle size={16} className="text-moss" />
                  Discord
                </a>
                <a className="inline-flex items-center gap-2 transition hover:text-white" href={creatorInfo.twitchUrl} target="_blank" rel="noreferrer">
                  <Twitch size={16} className="text-[#c084fc]" />
                  SmurfPlay Twitch
                </a>
                <a className="inline-flex items-center gap-2 transition hover:text-white" href={creatorInfo.youtubeUrl} target="_blank" rel="noreferrer">
                  <Youtube size={16} className="text-blood" />
                  SmurfPlay YouTube
                </a>
                <a className="inline-flex items-center gap-2 transition hover:text-white" href={creatorInfo.tiktokUrl} target="_blank" rel="noreferrer">
                  <Music2 size={16} className="text-ward" />
                  SmurfPlay TikTok
                </a>
                <a className="inline-flex items-center gap-2 transition hover:text-white" href={siteInfo.telegramUrl} target="_blank" rel="noreferrer">
                  <Send size={16} className="text-ward" />
                  Telegram
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-wide text-moss">Магазин</p>
              <div className="mt-4 grid gap-3 text-sm text-fog/70">
                <Link className="transition hover:text-white" href="/shop">
                  Каталог товарів
                </Link>
                <Link className="transition hover:text-white" href="/faq">
                  FAQ перед покупкою
                </Link>
                <Link className="transition hover:text-white" href="/top-up">
                  Поповнити баланс
                </Link>
                <a className="transition hover:text-white" href={`mailto:${siteInfo.supportEmail}`}>
                  {siteInfo.supportEmail}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
