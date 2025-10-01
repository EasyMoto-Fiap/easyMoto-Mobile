import api from './api';

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
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PagedMotos = {
  items: Moto[];
  total?: number;
};

export const categoriaReverse: Record<CategoriaNum, 'Pop' | 'Sport' | 'E'> = {
  0: 'Pop',
  1: 'Sport',
  2: 'E'
};

export function categoriaToTipo(c: CategoriaNum): 'Pop' | 'Sport' | 'E' {
  return categoriaReverse[c];
}

export async function listarMotos(page = 1, pageSize = 50, search?: string): Promise<PagedMotos> {
  const res = await api.get('/motos', { params: { page, pageSize, search } });
  if (Array.isArray(res.data)) return { items: res.data as Moto[] };
  if (res.data?.items) return { items: res.data.items as Moto[], total: res.data.total };
  return { items: [] };
}

export async function obterMoto(id: number): Promise<Moto> {
  const res = await api.get(`/motos/${id}`);
  return res.data as Moto;
}

type CreateOrUpdate = {
  placa: string;
  modelo: string;
  ano: number;
  categoria: CategoriaNum;
  statusOperacional: StatusOperacionalNum;
  filialId: number;
  ativo?: boolean;
  cor?: string;
  legendaStatusId?: number;
  qrCode?: string;
};

export async function criarMoto(data: CreateOrUpdate): Promise<Moto> {
  const res = await api.post('/motos', data);
  return res.data as Moto;
}

export async function atualizarMoto(id: number, data: CreateOrUpdate): Promise<Moto> {
  const res = await api.put(`/motos/${id}`, data);
  return res.data as Moto;
}

export async function deletarMoto(id: number): Promise<void> {
  await api.delete(`/motos/${id}`);
}
