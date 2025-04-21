export const salvarProjeto = (projeto: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('projetoAtual', JSON.stringify(projeto));
    }
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
  }
};

export const carregarProjeto = () => {
  try {
    if (typeof window !== 'undefined') {
      const projeto = localStorage.getItem('projetoAtual');
      return projeto ? JSON.parse(projeto) : null;
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar projeto:', error);
    return null;
  }
}; 