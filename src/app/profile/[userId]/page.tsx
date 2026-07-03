import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function ProfileView({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = await params;
  const userId = resolvedParams.userId;

  const user = await db.select().from(users).where(eq(users.id, userId)).then(res => res[0]);

  if (!user) {
    return <p>Usuário não encontrado.</p>;
  }

  return (
    <>
      <div className="text-[11px] font-bold text-[#667] mb-[10px]">
        <Link href="/" className="hover:underline">Início</Link> &raquo; Perfil de {user.username}
      </div>

      <div className="bg-panel-bg border border-panel-border p-[20px] flex gap-[20px]">
        <div className="w-[150px] text-center shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-[150px] max-w-full border border-[#999] p-[2px] bg-white mb-[10px]" />
          ) : (
            <div className="w-[150px] h-[150px] bg-[#e0e0e0] border border-[#ccc] mx-auto mb-[10px] flex items-center justify-center text-[#aaa]">Sem Avatar</div>
          )}
          <strong className="text-[16px] text-[#333]">{user.username}</strong>
          <div className="text-[11px] text-[#667] uppercase mt-[5px]">{user.title}</div>
        </div>

        <div className="flex-1">
          <table className="w-full text-[13px] border-collapse border border-[#ccc]">
            <tbody>
              <tr>
                <td className="w-[120px] bg-[#f9f9f9] border border-[#ccc] p-[8px] font-bold text-[#555]">Registrado em:</td>
                <td className="border border-[#ccc] p-[8px] text-[#333]">{user.joinDate}</td>
              </tr>
              <tr>
                <td className="bg-[#f9f9f9] border border-[#ccc] p-[8px] font-bold text-[#555]">Posts:</td>
                <td className="border border-[#ccc] p-[8px] text-[#333]">{user.postsCount}</td>
              </tr>
              <tr>
                <td className="bg-[#f9f9f9] border border-[#ccc] p-[8px] font-bold text-[#555]">Cargo:</td>
                <td className="border border-[#ccc] p-[8px] text-[#333] capitalize">{user.role}</td>
              </tr>
              <tr>
                <td colSpan={2} className="bg-[#f9f9f9] border border-[#ccc] p-[8px] font-bold text-[#555]">Biografia:</td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-[#ccc] p-[10px] text-[#333] leading-[1.6]">
                  {user.bio ? (
                    <span>
                      {user.bio}
                    </span>
                  ) : (
                    <span className="text-[#888]">Nenhuma biografia.</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
