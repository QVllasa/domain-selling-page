import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

// This is a root layout that just passes through to the locale-specific layout
export default function RootLayout({children}: Props) {
  return children;
}
