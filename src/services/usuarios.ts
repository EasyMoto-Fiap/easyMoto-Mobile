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
  filialId?: number;
};

export type UpdateUsuarioPayload = {
  nomeCompleto: string;
  email: string;
  telefone: string;
  cpf: string;
  cepFilial: string;
  senha?: string;
  confirmarSenha?: string;
  perfil: number;
  ativo: boolean;
  filialId?: number;
};

export type Usuario = {
  id: number;
  nomeCompleto: string;
  email: string;
  telefone: string;
  cpf: string;
  cepFilial: string;
  perfil: number;
  ativo: boolean;
  filialId: number;
};

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

export async function criarUsuario(data: CreateUsuarioPayload) {
  const res = await api.post('/usuarios', data);
  return res.data as Usuario;
}

export async function obterUsuarioPorId(id: number) {
  const res = await api.get(`/usuarios/${id}`);
  return res.data as Usuario;
}

export async function atualizarUsuario(id: number, data: UpdateUsuarioPayload) {
  const res = await api.put(`/usuarios/${id}`, data);
  return res.data as Usuario;
}

export async function deletarUsuario(id: number) {
  const res = await api.delete(`/usuarios/${id}`);
  return res.status;
}

export async function listarUsuarios(
  page = 1,
  pageSize = 200,
  perfil?: number,
): Promise<Paged<Usuario>> {
  const res = await api.get('/usuarios', { params: { page, pageSize, perfil } });
  const data = res.data as Paged<Usuario> | Usuario[];
  if (Array.isArray(data)) {
    return {
      items: perfil != null ? data.filter((u) => u.perfil === perfil) : data,
      totalCount: data.length,
      page,
      pageSize,
    };
  }
  if (perfil != null) {
    return { ...data, items: data.items.filter((u) => u.perfil === perfil) };
  }
  return data;
}

export async function listarFiliais(page = 1, pageSize = 100): Promise<Paged<Filial>> {
  const res = await api.get('/filiais', { params: { page, pageSize } });
  return res.data;
}
