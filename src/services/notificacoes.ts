import api from './api';

export type NotificacaoRequest = {
  tipo: number;
  mensagem: string;
  motoId?: number | null;
  usuarioOrigemId?: number | null;
  escopo?: number | null;
};

export type Notificacao = {
  id: number;
  tipo: number;
  mensagem: string;
  motoId?: number | null;
  usuarioOrigemId?: number | null;
  criadaEm?: string;
  escopo?: number | null;
};

export async function criarNotificacao(data: NotificacaoRequest) {
  const texto = (data?.mensagem || '').trim().toLowerCase();
  if (texto === 'moto cadastrada') {
    return {
      id: 0,
      tipo: data.tipo ?? 0,
      mensagem: data.mensagem,
      motoId: data.motoId ?? null,
      usuarioOrigemId: data.usuarioOrigemId ?? null,
      criadaEm: new Date().toISOString(),
      escopo: data.escopo ?? 0,
    } as Notificacao;
  }
  const res = await api.post('/notificacoes', data);
  return res.data as Notificacao;
}

export async function listarNotificacoes(params?: {
  escopo?: number;
  filialId?: number;
  page?: number;
  pageSize?: number;
}): Promise<Notificacao[]> {
  const res = await api.get('/notificacoes', { params });
  if (Array.isArray(res.data)) return res.data as Notificacao[];
  if (res.data?.items) return res.data.items as Notificacao[];
  return [];
}

export async function deletarNotificacao(id: number): Promise<void> {
  await api.delete(`/notificacoes/${id}`);
}
