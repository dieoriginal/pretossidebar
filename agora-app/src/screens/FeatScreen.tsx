import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
// Picker - usar @react-native-picker/picker em produção
// Por enquanto, usar TextInput com modal
import { apiClient } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function FeatScreen() {
  const [serviceType, setServiceType] = useState<'featuring' | 'production' | 'audiovisual'>('featuring');
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!details || !amount) {
      showToast('Por favor, preencha todos os campos', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createFeatRequest({
        serviceType,
        details,
        amount: parseFloat(amount),
        currency: 'EUR',
      });

      showToast('Pedido criado! Redirecionando...', 'success');
      
      // Redirecionar para pagamento
      if (response.feat.paymentLink) {
        // Abrir link de pagamento (WebView ou browser)
        // Linking.openURL(response.feat.paymentLink);
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Solicitar Featuring / Produção</Text>
        <Text style={styles.subtitle}>
          Preencha os detalhes do seu pedido
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Tipo de Serviço</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.serviceButton, serviceType === 'featuring' && styles.serviceButtonActive]}
              onPress={() => setServiceType('featuring')}
            >
              <Text style={[styles.serviceButtonText, serviceType === 'featuring' && styles.serviceButtonTextActive]}>
                Featuring
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.serviceButton, serviceType === 'production' && styles.serviceButtonActive]}
              onPress={() => setServiceType('production')}
            >
              <Text style={[styles.serviceButtonText, serviceType === 'production' && styles.serviceButtonTextActive]}>
                Produção
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.serviceButton, serviceType === 'audiovisual' && styles.serviceButtonActive]}
              onPress={() => setServiceType('audiovisual')}
            >
              <Text style={[styles.serviceButtonText, serviceType === 'audiovisual' && styles.serviceButtonTextActive]}>
                Audiovisual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Detalhes do Pedido</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Descreva o que precisa..."
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Valor (EUR)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Continuar para Pagamento</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 120,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  serviceButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  serviceButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  serviceButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  serviceButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});



