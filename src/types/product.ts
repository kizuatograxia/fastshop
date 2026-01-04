export interface Product {
    id: string;
    nome: string;
    preco: number;
    precoAntigo: number;
    imagem: string;
    categoria: string;
    parcelas: number;
}

export interface CartItem extends Product {
    quantidade: number;
}
