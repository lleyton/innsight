import { QueryClient, QueryClientProvider } from "react-query";
import React from "react";
import "tailwindcss/tailwind.css";

const queryClient = new QueryClient();

function MyApp({
  Component,
  pageProps,
}: {
  Component: React.FC;
  pageProps: any;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
