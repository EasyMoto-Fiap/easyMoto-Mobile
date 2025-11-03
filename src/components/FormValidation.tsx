import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '../i18n'; 

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

export const makeCadastroSchema = () =>
  z
    .object({
      nome: z
        .string()
        .trim()
        .min(1, t('signup.validation.nomeObrigatorio'))
        .regex(/^[A-Za-zÀ-ú\s]+$/, t('signup.validation.apenasLetras')), 
      email: z
        .string()
        .trim()
        .email(t('signup.validation.emailInvalido')),
      telefone: z
        .string()
        .transform(toDigits)
        .refine(v => v.length === 10 || v.length === 11, t('signup.validation.telefoneInvalido')),
      senha: z
        .string()
        .min(8, t('signup.validation.senhaCurta')),
      confirmarSenha: z.string(), 
      cpf: z
        .string()
        .transform(toDigits)
        .refine(v => v.length === 11, t('signup.validation.cpfInvalido')),
      cep: z
        .string()
        .transform(toDigits)
        .refine(v => v.length === 8, t('signup.validation.cepInvalido')),
    })
    .refine(d => d.senha === d.confirmarSenha, {
      path: ['confirmarSenha'],
      message: t('signup.validation.senhasNaoConferem'),
    });

export const cadastroSchema = makeCadastroSchema();

export type CadastroFormValues = z.infer<typeof cadastroSchema>;

export function useCadastroForm() {
  const schema = makeCadastroSchema();
  return useForm<CadastroFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      confirmarSenha: '',
      cpf: '',
      cep: '',
    },
  });
}
