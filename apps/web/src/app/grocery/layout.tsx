export const metadata = {
  title: 'Lista de Compras',
  description: 'Grocery shopping list with weekly budget',
};

export default function GroceryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <meta name="theme-color" content="#667eea" />
      <link rel="manifest" href="/grocery/manifest.json" />
      <link rel="apple-touch-icon" href="/grocery/icon-192x192.svg" />
      {children}
    </>
  );
}
