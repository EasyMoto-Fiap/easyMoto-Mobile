import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { FontAwesome } from '@expo/vector-icons';

export default function CadastroOperador({ navigation }) {
const { theme } = useContext(ThemeContext);
const isDark = theme === 'dark';
const themeColors = isDark ? colors.dark : colors.light;

const [nome, setNome] = useState('');
const [email, setEmail] = useState('');
const [senha, setSenha] = useState('');
const [confirmarSenha, setConfirmarSenha] = useState('');
const [cpf, setCpf] = useState('');
const [cep, setCep] = useState('');
const [mostrarSenha, setMostrarSenha] = useState(false);
const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

const formatarCPF = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
};

const formatarCEP = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
};

const validarCampos = () => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const cepLimpo = cep.replace(/\D/g, '');

    if (!/^[A-Za-zÀ-ú\s]+$/.test(nome)) {
    Alert.alert('Nome inválido', 'O nome não pode conter números ou símbolos.');
    return;
    }

    if (!email.includes('@')) {
    Alert.alert('Email inválido', 'O email deve conter @');
    return;
    }

    if (senha.length !== 8) {
    Alert.alert('Senha inválida', 'A senha deve conter exatamente 8 caracteres.');
    return;
    }

    if (senha !== confirmarSenha) {
    Alert.alert('Senhas diferentes', 'As senhas não coincidem.');
    return;
    }

    if (!/^\d{11}$/.test(cpfLimpo)) {
    Alert.alert('CPF inválido', 'O CPF deve conter exatamente 11 dígitos numéricos.');
    return;
    }

    if (!/^\d{8}$/.test(cepLimpo)) {
    Alert.alert('CEP inválido', 'O CEP deve conter exatamente 8 dígitos numéricos.');
    return;
    }

    Alert.alert('Cadastro realizado com sucesso!');
};

return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
    <ThemeToggleButton />

    <Text style={[styles.logo, { color: themeColors.text }]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
    </Text>

    <Text style={[styles.title, { color: themeColors.text }]}>Cadastro do operador:</Text>

    <TextInput
        style={styles.input}
        placeholder="Nome:"
        placeholderTextColor="#666"
        value={nome}
        onChangeText={setNome}
    />
    <TextInput
        style={styles.input}
        placeholder="Email:"
        placeholderTextColor="#666"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
    />

    <View style={styles.senhaContainer}>
        <TextInput
        style={[styles.input, { flex: 1, marginBottom: 0 }]}
        placeholder="Senha (8 caracteres):"
        placeholderTextColor="#666"
        secureTextEntry={!mostrarSenha}
        value={senha}
        onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.iconeOlho}>
        <FontAwesome name={mostrarSenha ? 'eye' : 'eye-slash'} size={20} color="#666" />
        </TouchableOpacity>
    </View>

    <View style={styles.senhaContainer}>
        <TextInput
        style={[styles.input, { flex: 1, marginBottom: 0 }]}
        placeholder="Confirmar senha:"
        placeholderTextColor="#666"
        secureTextEntry={!mostrarConfirmar}
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        />
        <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)} style={styles.iconeOlho}>
        <FontAwesome name={mostrarConfirmar ? 'eye' : 'eye-slash'} size={20} color="#666" />
        </TouchableOpacity>
    </View>

    <TextInput
        style={styles.input}
        placeholder="CPF:"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={cpf}
        onChangeText={(valor) => setCpf(formatarCPF(valor))}
        maxLength={14}
    />
    <TextInput
        style={styles.input}
        placeholder="CEP da Filial:"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={cep}
        onChangeText={(valor) => setCep(formatarCEP(valor))}
        maxLength={9}
    />

    <TouchableOpacity style={styles.button} onPress={validarCampos}>
        <Text style={styles.buttonText}>Acessar</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigation.navigate('LoginOperador')}>
        <Text style={[styles.linkText, { color: themeColors.text }]}>
        Já tem conta? Faça Login
        </Text>
    </TouchableOpacity>
    </View>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
},
logo: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
},
title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
},
input: {
    backgroundColor: '#e4e4e4',
    padding: 15,
    borderRadius: 30,
    marginBottom: 15,
},
senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
},
iconeOlho: {
    position: 'absolute',
    right: 15,
},
button: {
    backgroundColor: '#004d25',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
},
buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
},
linkText: {
    textAlign: 'center',
    fontSize: 14,
},
});
