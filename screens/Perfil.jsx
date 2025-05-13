import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { FontAwesome } from '@expo/vector-icons';

export default function Perfil() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [imagem, setImagem] = useState(null);
  const [editando, setEditando] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [filial, setFilial] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      const dadosSalvos = await AsyncStorage.getItem('usuario');
      const foto = await AsyncStorage.getItem('fotoPerfil');
      if (foto) setImagem(foto);
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        setNome(dados.nome || '');
        setEmail(dados.email || '');
        setTelefone(dados.telefone || '');
        setCpf(dados.cpf || '');
        setFilial(dados.filial || '');
      }
    };
    carregarDados();
  }, []);

  const handleEscolherFonteImagem = () => {
    Alert.alert(
      'Selecionar imagem',
      'Escolha uma opção',
      [
        {
          text: 'Galeria',
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permissão necessária', 'Permita acesso à galeria.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setImagem(uri);
              await AsyncStorage.setItem('fotoPerfil', uri);
            }
          },
        },
        {
          text: 'Câmera',
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permissão necessária', 'Permita acesso à câmera.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setImagem(uri);
              await AsyncStorage.setItem('fotoPerfil', uri);
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const salvarAlteracoes = async () => {
    const dadosAtualizados = { nome, email, telefone, cpf, filial };
    if (novaSenha) dadosAtualizados.senha = novaSenha;

    await AsyncStorage.setItem('usuario', JSON.stringify(dadosAtualizados));
    Alert.alert('Sucesso', 'Informações atualizadas.');
    setEditando(false);
    setNovaSenha('');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />

      <Text style={[styles.logo, { color: themeColors.text }]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
      </Text>

      <TouchableOpacity onPress={handleEscolherFonteImagem}>
        <View style={styles.avatar}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.avatarImage} />
          ) : (
            <FontAwesome name="motorcycle" size={40} color="#888" />
          )}
        </View>
      </TouchableOpacity>

      <Text style={[styles.name, { color: themeColors.text }]}>{nome || 'Usuário'}</Text>
      <Text style={[styles.role, { color: themeColors.text }]}>Operador</Text>

      <Text style={[styles.section, { color: themeColors.text }]}>Dados:</Text>

      <TextInput style={styles.input} editable={editando} value={nome} onChangeText={setNome} placeholder="Nome completo" />
      <TextInput style={styles.input} editable={editando} value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput style={styles.input} editable={editando} value={telefone} onChangeText={setTelefone} placeholder="Telefone" />
      <TextInput style={styles.input} editable={editando} value={cpf} onChangeText={setCpf} placeholder="CPF" />
      <TextInput style={styles.input} editable={editando} value={filial} onChangeText={setFilial} placeholder="Filial" />

      {editando && (
        <TextInput
          style={styles.input}
          value={novaSenha}
          onChangeText={setNovaSenha}
          placeholder="Nova senha (opcional)"
          secureTextEntry
        />
      )}

      {!editando ? (
        <TouchableOpacity style={styles.button} onPress={() => setEditando(true)}>
          <Text style={styles.buttonText}>Editar informações</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={salvarAlteracoes}>
          <Text style={styles.buttonText}>Salvar alterações</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e4e4e4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#e4e4e4',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#004d25',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
