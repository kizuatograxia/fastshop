export interface MockRaffle {
  id: string;
  titulo: string;
  descricao: string;
  premio: string;
  premioValor: number;
  imagem: string;
  dataFim: string;
  participantes: number;
  maxParticipantes: number;
  custoNFT: number;
  status: "ativo" | "encerrado" | "em_breve";
  categoria: string;
}

export interface MockReview {
  id: string;
  userName: string;
  userAvatar: string;
  raffleTitle: string;
  rating: number;
  comment: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

export interface MockParticipant {
  id: string;
  name: string;
  email: string;
  cpf: string;
  raffleId: string;
  raffleTitle: string;
  joinedAt: string;
  ticketNumber: number;
}

export const mockRaffles: MockRaffle[] = [
  {
    id: "1",
    titulo: "iPhone 15 Pro Max",
    descricao: "Concorra ao novo iPhone 15 Pro Max 256GB",
    premio: "iPhone 15 Pro Max",
    premioValor: 8999,
    imagem: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
    dataFim: "2026-03-15",
    participantes: 234,
    maxParticipantes: 500,
    custoNFT: 25,
    status: "ativo",
    categoria: "Eletrônicos",
  },
  {
    id: "2",
    titulo: "PlayStation 5 + 3 Jogos",
    descricao: "PS5 com 3 jogos à sua escolha",
    premio: "PlayStation 5 Bundle",
    premioValor: 4500,
    imagem: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
    dataFim: "2026-02-28",
    participantes: 189,
    maxParticipantes: 300,
    custoNFT: 20,
    status: "ativo",
    categoria: "Games",
  },
  {
    id: "3",
    titulo: "MacBook Air M3",
    descricao: "MacBook Air com chip M3, 16GB RAM",
    premio: "MacBook Air M3",
    premioValor: 12000,
    imagem: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    dataFim: "2026-04-01",
    participantes: 78,
    maxParticipantes: 400,
    custoNFT: 35,
    status: "em_breve",
    categoria: "Eletrônicos",
  },
  {
    id: "4",
    titulo: "Smart TV 65\" Samsung",
    descricao: "TV Samsung 65 polegadas 4K",
    premio: "Smart TV Samsung 65\"",
    premioValor: 5200,
    imagem: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
    dataFim: "2026-01-20",
    participantes: 300,
    maxParticipantes: 300,
    custoNFT: 22,
    status: "encerrado",
    categoria: "Eletrônicos",
  },
];

export const mockReviews: MockReview[] = [
  {
    id: "r1",
    userName: "Carlos Silva",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    raffleTitle: "Smart TV 65\" Samsung",
    rating: 5,
    comment: "Recebi o prêmio em 3 dias! Incrível a organização.",
    date: "2026-01-25",
    status: "pending",
  },
  {
    id: "r2",
    userName: "Ana Oliveira",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    raffleTitle: "iPhone 15 Pro Max",
    rating: 4,
    comment: "Ainda estou participando, mas a experiência é muito boa até agora.",
    date: "2026-02-10",
    status: "pending",
  },
  {
    id: "r3",
    userName: "João Santos",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao",
    raffleTitle: "PlayStation 5 + 3 Jogos",
    rating: 5,
    comment: "Melhor plataforma de sorteios! Super confiável.",
    date: "2026-02-01",
    status: "approved",
  },
  {
    id: "r4",
    userName: "Maria Souza",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    raffleTitle: "MacBook Air M3",
    rating: 3,
    comment: "Poderia ter mais opções de pagamento.",
    date: "2026-02-08",
    status: "rejected",
  },
];

export const mockParticipants: MockParticipant[] = [
  { id: "p1", name: "Carlos Silva", email: "carlos@email.com", cpf: "***.***.***-12", raffleId: "1", raffleTitle: "iPhone 15 Pro Max", joinedAt: "2026-02-01", ticketNumber: 42 },
  { id: "p2", name: "Ana Oliveira", email: "ana@email.com", cpf: "***.***.***-34", raffleId: "1", raffleTitle: "iPhone 15 Pro Max", joinedAt: "2026-02-03", ticketNumber: 87 },
  { id: "p3", name: "João Santos", email: "joao@email.com", cpf: "***.***.***-56", raffleId: "2", raffleTitle: "PlayStation 5 + 3 Jogos", joinedAt: "2026-02-05", ticketNumber: 15 },
  { id: "p4", name: "Maria Souza", email: "maria@email.com", cpf: "***.***.***-78", raffleId: "1", raffleTitle: "iPhone 15 Pro Max", joinedAt: "2026-02-07", ticketNumber: 123 },
  { id: "p5", name: "Pedro Lima", email: "pedro@email.com", cpf: "***.***.***-90", raffleId: "2", raffleTitle: "PlayStation 5 + 3 Jogos", joinedAt: "2026-02-09", ticketNumber: 201 },
  { id: "p6", name: "Juliana Costa", email: "juliana@email.com", cpf: "***.***.***-11", raffleId: "4", raffleTitle: "Smart TV 65\" Samsung", joinedAt: "2026-01-15", ticketNumber: 55 },
];
