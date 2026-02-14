import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const roboto = Roboto({
    subsets: ["latin"]
});

export const metadata = {
    title: "Chatbot",
    description: "AI Chatbot with Speech Recognition",
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: 'cover'
    },
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f8f9fa' },
        { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' }
    ],
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Chatbot'
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
