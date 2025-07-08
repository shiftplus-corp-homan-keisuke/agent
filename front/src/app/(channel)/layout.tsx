import SideNav from "@/components/sidenav/SideNav";
import "../globals.css";

export default function ChannelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="flex h-screen">
          <div className="w-64 bg-gray-100 border-r border-gray-200">
            <SideNav />
          </div>
          <div className="flex-1 p-4">{children}</div>
        </div>
      </body>
    </html>
  );
}
