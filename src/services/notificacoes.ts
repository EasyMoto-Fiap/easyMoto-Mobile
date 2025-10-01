import api from './api';

export type NotificacaoRequest = {
    tipo: number;
    mensagem: string;
    motoId?: number | null;
    usuarioOrigemId: number;
    escopo: number;
};

export async function criarNotificacao(data: NotificacaoRequest) {
    const res = await api.post('/notificacoes', data);
    return res.data;
}

export async function listarNotificacoes(params?: { escopo?: number; filialId?: number; page?: number; pageSize?: number }) {
    const res = await api.get('/notificacoes', { params });
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.items) return res.data.items;
    return [];
}
