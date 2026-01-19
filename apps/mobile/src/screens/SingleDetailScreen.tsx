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

export default function SingleDetailScreen() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await apiClient.getPublicProject(id);
      setProject(response.project);
    } catch (error) {
      console.error('Error loading project:', error);
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

  if (!project) {
    return (
      <View style={styles.center}>
        <Text>Projeto não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.artist}>{project.artist}</Text>
        {project.featuring && project.featuring.length > 0 && (
          <Text style={styles.featuring}>
            ft. {project.featuring.join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Progresso</Text>
        <Text style={styles.progressValue}>{project.progress}%</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${project.progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          Etapa {project.currentStep + 1} de {project.totalSteps}
        </Text>
      </View>

      {project.synopsis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text style={styles.sectionContent}>{project.synopsis}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <ProjectTimeline
          currentStep={project.currentStep}
          totalSteps={project.totalSteps}
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
  artist: {
    fontSize: 16,
    color: '#666666',
  },
  featuring: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
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



