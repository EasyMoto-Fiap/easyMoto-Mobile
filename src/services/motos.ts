import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { criarNotificacao } from './notificacoes';

export type CategoriaNum = 0 | 1 | 2;
export type StatusOperacionalNum = 0 | 1 | 2;

export type Moto = {
  id: number;
  placa: string;
  modelo: string;
  ano: number;
  categoria: CategoriaNum;
  statusOperacional: StatusOperacionalNum;
  filialId: number;
  ativo: boolean;
  cor?: string;
  legendaStatusId?: number;
  qrCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateOrUpdate = {
  placa: string;
  modelo: string;
  ano: number;
  cor: string;
  ativo: boolean;
  filialId: number;
  categoria: CategoriaNum;
  statusOperacional: StatusOperacionalNum;
  legendaStatusId?: number;
  qrCode?: string | null;
};

function nomeUsuario(u: any) {
  return u?.nomeCompleto || u?.nome || u?.name || 'Desconhecido';
}

export async function listarMotos(page: number, pageSize: number) {
  const res = await api.get('/motos', { params: { page, pageSize } });
  return res.data;
}

export async function obterMoto(id: number): Promise<Moto | null> {
  const res = await api.get(`/motos/${id}`);
  return res.data as Moto;
}

export async function criarMoto(data: CreateOrUpdate): Promise<Moto> {
  const res = await api.post('/motos', data);
  const created = res.data as Moto;
  try {
    const raw = await AsyncStorage.getItem('usuarioAtual');
    const u = raw ? JSON.parse(raw) : undefined;
    const nome = nomeUsuario(u);
    const uid = u?.id ? Number(u.id) : 0;
    const msg = `Moto cadastrada:\nOperador: ${nome} - MOTO: ${created.placa} ${created.modelo}`;
    await criarNotificacao({ tipo: 0, mensagem: msg, motoId: created.id, usuarioOrigemId: uid, escopo: 0 });
  } catch {}
  return created;
}

export async function atualizarMoto(id: number, data: CreateOrUpdate): Promise<Moto> {
  const res = await api.put(`/motos/${id}`, data);
  return res.data as Moto;
}

export async function deletarMoto(id: number): Promise<void> {
  await api.delete(`/motos/${id}`);
}
