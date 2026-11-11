// Fonte instalada via npm (@fontsource/poppins): não depende do Google Fonts no build
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "./globals.css";

export const metadata = { title: "Valit", description: "Controle de validade de produtos" };

// Aplica o tema salvo (claro/escuro) antes da página aparecer, sem "piscar"
const scriptTema = `try{var t=localStorage.getItem("tema");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
