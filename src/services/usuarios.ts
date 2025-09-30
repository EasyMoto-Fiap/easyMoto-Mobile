import api from './api';

export type CreateUsuarioPayload = {
    nomeCompleto: string;
    email: string;
    telefone: string;
    cpf: string;
    cepFilial: string;
    senha: string;
    confirmarSenha: string;
    perfil: number;
    ativo: boolean;
    filialId: number;
    };

export async function criarUsuario(data: CreateUsuarioPayload) {
    const res = await api.post('/usuarios', data);
    return res.data;
    }

export type Filial = {
    id: number;
    nome: string;
    cep: string;
    cidade: string;
    uf: string;
    };

export type Paged<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    };

export async function listarFiliais(page = 1, pageSize = 100): Promise<Paged<Filial>> {
    const res = await api.get('/filiais', { params: { page, pageSize } });
    return res.data;
    }
