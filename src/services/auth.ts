import api from './api';

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

export type LoginResponse = {
  token: string;
  usuario: Usuario;
};

export async function login(data: { email: string; senha: string }): Promise<LoginResponse> {
  const res = await api.post('/auth/login', data);
  return res.data;
}
