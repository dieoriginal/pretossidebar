import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProjectTimelineProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_NAMES = [
  'Maquete',
  'Gravação',
  'Vestuário',
  'Orçamento',
  'Filmagem',
  'Fotografia',
  'Edição de Vídeo',
  'Contratualização',
  'Direitos Autorais',
  'Lançamento',
];

export function ProjectTimeline({ currentStep, totalSteps }: ProjectTimelineProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index <= currentStep;
        const isCurrent = index === currentStep;
        const stepName = STEP_NAMES[index] || `Etapa ${index + 1}`;

        return (
          <View
            key={index}
            style={[
              styles.step,
              isCompleted && styles.stepCompleted,
              isCurrent && styles.stepCurrent,
            ]}
          >
            <View
              style={[
                styles.circle,
                isCompleted && styles.circleCompleted,
              ]}
            />
            <Text
              style={[
                styles.stepText,
                isCompleted && styles.stepTextCompleted,
              ]}
            >
              {stepName}
            </Text>
            {isCurrent && (
              <Text style={styles.currentLabel}>Em progresso...</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepCompleted: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  stepCurrent: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
  },
  circleCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  stepTextCompleted: {
    color: '#000000',
    fontWeight: '500',
  },
  currentLabel: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
  },
});



