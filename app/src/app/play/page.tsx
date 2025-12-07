import prisma from "../../lib/prisma";
import MatchStart from "../../components/MatchStart";

type Props = {
  searchParams?: Promise<{ [key: string]: string | undefined }>
}

export default async function PlayPage(params: Props) {
    const searchParams = await params.searchParams;
  const challengeIdParam = searchParams?.challengeId;
  const levelIdParam = searchParams?.levelId;
  const challengeId = challengeIdParam ? parseInt(challengeIdParam, 10) : null;
  const levelId = levelIdParam ? parseInt(levelIdParam, 10) : null;

  if (!challengeId) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Desafio não especificado</h2>
        <p>Forneça `challengeId` na query string.</p>
      </div>
    );
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: {
      id: true,
      name: true,
      instructions: true,
      levels: {
        select: {
          id: true,
          name: true,
        },
        orderBy: { id: 'asc' }
      }
    }
  });

  if (!challenge) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Desafio não encontrado</h2>
      </div>
    );
  }

  return (
    <MatchStart
      challengeId={challenge.id}
      levelId={levelId}
      name={challenge.name}
      instructions={challenge.instructions}
      levels={challenge.levels}
    />
  );
}
