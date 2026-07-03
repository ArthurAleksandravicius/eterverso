import type { Metadata } from 'next';

import './index.css';
import Link from 'next/link';
import { logout } from '@/actions/authActions';
import { getCurrentUser } from '@/utils/auth';
import { UserProvider } from '@/context/UserContext';
import Button from '@/components/Button';


export const metadata: Metadata = {
  title: 'Éterverso',
  description: 'Fórum, Wiki de Personagens & Roleplay',
};

// Layout da site (se mantém como base para todas as outras páginas)
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtém o usuário logado
  const user = await getCurrentUser()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <UserProvider user={user}>
          <div id="top-bar" className="w-full min-w-3xl bg-linear-to-b from-topbar-start to-topbar-end text-white px-[10px] py-[4px] text-[11px] flex justify-between items-center">
            <div id="top-user-info">
              {user?.username ? `Bem-vindo, ${user?.username}!` : "Bem-vindo, visitante!"}
            </div>
            <div>
              <span id="top-btn-area" className="flex gap-3">
                <Link href="/about" className="nav-link">Sobre o Projeto</Link>
                {
                  user ?
                    <form action={logout}>
                      <button type="submit" className='nav-link'>Sair</button>
                    </form>
                    :
                    <>
                      <Link href="/auth/login" className="nav-link">Entrar</Link>
                      <Link href="/auth/signup" className="nav-link">Registrar</Link>
                    </>
                }
              </span>
            </div>
          </div>

          <div id="wrapper" className="w-full max-w-[900px] min-w-3xl mx-auto bg-panel-bg border border-panel-border mt-[15px] mb-[30px] rounded-sm">
            <div id="logo-bar" className="bg-linear-to-b from-logobar-start to-logobar-end pt-[12px] px-[20px] pb-[8px]">
              <h1 className="text-logo-text text-[28px] drop-shadow-[2px_2px_4px_rgba(0,0,0,1)] font-serif tracking-[1px] m-0">Éterverso</h1>
              <p className="text-[#99aacc] text-[11px] font-bold mt-[2px] mb-0 italic">Fórum, Wiki de Personagens &amp; Roleplay</p>
            </div>

            <div id="nav-bar" className="bg-[#eef] border-b border-panel-border py-[5px] px-[15px] flex items-center shadow-[0_1px_3px_rgba(0,0,0,0.1)] gap-2">
              <Link href="/">
                <Button>
                  Fórum
                </Button>
              </Link>

              <Link href="/wiki">
                <Button>
                  Personagens
                </Button>
              </Link>

              {
                user?.isStaff && (
                  <Link href="/admin">
                    <Button>
                      Admin
                    </Button>
                  </Link>
                )
              }

              {user && (
                <div className="ml-auto flex gap-2 items-center pr-2">

                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-[32px] h-[32px] rounded-sm object-cover object-center border border-[#999]" />
                  ) : (
                    <div className="w-[32px] h-[32px] rounded-sm bg-[#ccc] border border-[#999] flex items-center justify-center text-[11px] text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <Link href={`/user/${user.id}`} className="flex items-center text-[#333] hover:text-brand-link font-bold text-[12px] no-underline transition-colors">
                    <span>{user.username}</span>
                  </Link>

                </div>
              )}
            </div>

            <div id="main" className="p-[15px]">
              {children}
            </div>
          </div>

          <div id="footer" className="bg-btn-primary mx-auto max-w-[900px] min-w-3xl p-2 text-white text-center text-[12px] mt-[-15px] mb-[30px] rounded-sm border border-panel-border">
            Éterverso &copy; 2026<br />
          </div>

          <div id="modal-container"></div>
        </UserProvider>
      </body>
    </html>
  );
}
