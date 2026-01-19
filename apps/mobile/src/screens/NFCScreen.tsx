import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { apiClient } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function NFCScreen() {
  const [scanning, setScanning] = useState(false);
  const [hasNFC, setHasNFC] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    checkNFC();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const checkNFC = async () => {
    const supported = await NfcManager.isSupported();
    setHasNFC(supported);
    if (supported) {
      await NfcManager.start();
    }
  };

  const readNFC = async () => {
    if (!hasNFC) {
      showToast('NFC não suportado neste dispositivo', 'error');
      return;
    }

    try {
      setScanning(true);
      
      // Request technology
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      // Read tag
      const tag = await NfcManager.getTag();
      
      if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
        // Extract tag ID from NDEF message
        const ndefRecord = tag.ndefMessage[0];
        const tagId = Ndef.text.decodePayload(ndefRecord.payload);
        
        // Scan tag via API
        const response = await apiClient.scanNFCTag(tagId);
        
        showToast('Tag lida com sucesso!', 'success');
        
        // Redirect to content
        if (response.tag.redirectUrl) {
          Linking.openURL(response.tag.redirectUrl);
        } else if (response.tag.contentUrl) {
          Linking.openURL(response.tag.contentUrl);
        }
      } else {
        showToast('Tag NFC não contém dados válidos', 'error');
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled') {
        showToast('Erro ao ler tag NFC', 'error');
      }
    } finally {
      setScanning(false);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  if (!hasNFC) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            NFC não está disponível neste dispositivo
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ler Tag NFC</Text>
        <Text style={styles.subtitle}>
          Aproxima o teu dispositivo de uma tag NFC para aceder ao conteúdo
        </Text>

        <TouchableOpacity
          style={[styles.button, scanning && styles.buttonDisabled]}
          onPress={readNFC}
          disabled={scanning}
        >
          {scanning ? (
            <>
              <ActivityIndicator color="#FFFFFF" style={styles.spinner} />
              <Text style={styles.buttonText}>A ler tag...</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Iniciar Leitura</Text>
          )}
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            • Mantém o dispositivo próximo da tag{'\n'}
            • Aguarda até ouvir um som ou vibração{'\n'}
            • O conteúdo será aberto automaticamente
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginBottom: 8,
  },
  info: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});



