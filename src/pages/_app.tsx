import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { ApiProvider } from "@/components/ApiProvider";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ApiProvider>
        <Component {...pageProps} />
        <Toaster />
      </ApiProvider>
    </SessionProvider>
  );
}
