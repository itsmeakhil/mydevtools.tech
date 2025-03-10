export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark:bg-black dark:text-white bg-white text-black min-h-screen">
      {children}
    </div>
  );
}
