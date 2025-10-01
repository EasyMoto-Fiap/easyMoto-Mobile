import api from './api';

export type PatioMoto = {
  id: number;
  placa: string;
  modelo: string;
  categoria?: number | string;
  statusOperacional?: number;
  latitude?: number;
  longitude?: number;
  cor?: string;
  filialId?: number;
};

export async function listarPatioMotos(filialId: number, page = 1, pageSize = 500): Promise<{ items: PatioMoto[] }> {
  try {
    const res = await api.get('/patio/motos', { params: { filialId, page, pageSize } });
    if (Array.isArray(res.data)) return { items: res.data };
    if (res.data?.items) return { items: res.data.items };
    return { items: [] };
  } catch {
    const res2 = await api.get('/motos', { params: { page, pageSize } });
    const arr = res2.data?.items ?? (Array.isArray(res2.data) ? res2.data : []);
    const items = (arr as any[]).filter((m) => !filialId || m.filialId === filialId);
    return { items };
  }
}

export async function registrarEntradaPatio(data: { motoId: number; filialId: number; statusOperacional: number }) {
  try {
    const res = await api.post('/patio/entradas', data);
    return res.data;
  } catch (e: any) {
    if (e?.response?.status === 404) {
      const res2 = await api.post('/patio', data);
      return res2.data;
    }
    throw e;
  }
}
