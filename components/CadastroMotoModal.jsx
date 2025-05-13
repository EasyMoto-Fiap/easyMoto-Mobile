import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

const statusOpcoes = [
  { label: 'Pendência', cor: 'yellow' },
  { label: 'Reparos Simples', cor: 'blue' },
  { label: 'Defeito grave', cor: 'red' },
  { label: 'Manutenção', cor: 'gray' },
  { label: 'Pronta para aluguel', cor: 'green' },
  { label: 'Sem placa', cor: 'purple' },
  { label: 'Minha Mottu', cor: 'pink' },
];

export default function CadastroMotoModal({ visible, onClose, onSalvar }) {
  const [fileira, setFileira] = useState('A');
  const [numero, setNumero] = useState('');
  const [status, setStatus] = useState('green');

  const salvar = () => {
    if (!numero) return;
    const nome = `Moto ${fileira.toUpperCase()}${numero}`;
    onSalvar({ nome, status });
    setFileira('A');
    setNumero('');
    setStatus('green');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Cadastrar nova moto</Text>

          <TextInput
            style={styles.input}
            placeholder="Número (ex: 3)"
            keyboardType="numeric"
            value={numero}
            onChangeText={setNumero}
          />

          <TextInput
            style={styles.input}
            placeholder="Fileira (A, B ou C)"
            maxLength={1}
            value={fileira}
            onChangeText={(t) => setFileira(t.toUpperCase())}
          />

          <Text style={styles.label}>Status:</Text>
          <Picker
            selectedValue={status}
            style={styles.input}
            onValueChange={(itemValue) => setStatus(itemValue)}
          >
            {statusOpcoes.map((s) => (
              <Picker.Item label={s.label} value={s.cor} key={s.cor} />
            ))}
          </Picker>

          <TouchableOpacity style={styles.botao} onPress={salvar}>
            <Text style={styles.botaoTexto}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelar} onPress={onClose}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '85%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#eee',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  label: {
    marginBottom: 4,
  },
  botao: {
    backgroundColor: '#00c853',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelar: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelarTexto: {
    color: '#555',
  },
});
