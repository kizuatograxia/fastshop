export interface NFT {
    id: string;
    nome: string;
    emoji: string;
    preco: number;
    raridade: "comum" | "raro" | "epico" | "lendario";
    descricao: string;
    cor: string;
}

export interface Raffle {
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

export interface OwnedNFT extends NFT {
    quantidade: number;
}
