import { ToastProvider } from "@/components/Toast";

export default function AppSegmentLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
