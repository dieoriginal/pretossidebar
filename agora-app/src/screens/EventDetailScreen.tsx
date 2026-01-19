import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { apiClient } from '../services/api';
import { ProjectTimeline } from '../components/ProjectTimeline';

export default function EventDetailScreen() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const response = await apiClient.getPublicEvent(id);
      setEvent(response.event);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text>Evento não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.eventName}</Text>
        <Text style={styles.venue}>{event.venue}</Text>
        {event.date && (
          <Text style={styles.date}>
            {new Date(event.date).toLocaleDateString('pt-PT')}
          </Text>
        )}
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Progresso</Text>
        <Text style={styles.progressValue}>{event.progress}%</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${event.progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          Etapa {event.currentStep + 1} de {event.totalSteps}
        </Text>
      </View>

      {event.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.sectionContent}>{event.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <ProjectTimeline
          currentStep={event.currentStep}
          totalSteps={event.totalSteps}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  venue: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  progressCard: {
    padding: 16,
    margin: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});



