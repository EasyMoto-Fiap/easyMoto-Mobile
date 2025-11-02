import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const formatarCPF = (valor: string) =>
  valor
    .replace(/\D/g, '')
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');

export const formatarCEP = (valor: string) =>
  valor.replace(/\D/g, '').replace(/^(\d{5})(\d{1,3})/, '$1-$2');

export const formatarTelefone = (valor: string) => {
  const n = valor.replace(/\D/g, '');
  let v = n;
  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length > 10) v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  else if (v.length > 9) v = v.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  return v;
};

const toDigits = (v: string) => v.replace(/\D/g, '');

export const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  senha: z.string().min(8, 'Senha com no mínimo 8 caracteres'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export function useLoginForm() {
  return useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', senha: '' },
  });
}

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(1, 'Informe seu nome').regex(/^[A-Za-zÀ-ú\s]+$/, 'Apenas letras'),
    email: z.string().trim().email('Email inválido'),
    telefone: z.string().transform(toDigits).refine(v => v.length === 10 || v.length === 11, 'Telefone inválido'),
    senha: z.string().min(8, 'Senha com no mínimo 8 caracteres'),
    confirmarSenha: z.string(),
    cpf: z.string().transform(toDigits).refine(v => v.length === 11, 'CPF deve ter 11 dígitos'),
    cep: z.string().transform(toDigits).refine(v => v.length === 8, 'CEP deve ter 8 dígitos'),
  })
  .refine(d => d.senha === d.confirmarSenha, { path: ['confirmarSenha'], message: 'Senhas não coincidem' });

export type CadastroFormValues = z.infer<typeof cadastroSchema>;

export function useCadastroForm() {
  return useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    mode: 'onChange',
    defaultValues: { nome: '', email: '', telefone: '', senha: '', confirmarSenha: '', cpf: '', cep: '' },
  });
}
