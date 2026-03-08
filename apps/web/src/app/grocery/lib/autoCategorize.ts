// Auto-categorization system based on item name

import { Category } from '../types';

interface CategoryRule {
  category: Category;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Mercearia / Básicos',
    keywords: [
      'arroz', 'massa', 'macarrão', 'macarrao', 'feijão', 'feijao', 'lentilha',
      'azeite', 'óleo', 'oleo', 'vinagre', 'sal', 'açúcar', 'acucar', 'farinha',
      'aveia', 'cereais', 'muesli', 'granola', 'mel', 'geleia',
      'manteiga amendoim', 'manteiga cacau', 'ketchup', 'mostarda', 'maionese',
    ],
  },
  {
    category: 'Hortofrutícolas',
    keywords: [
      'banana', 'maçã', 'maca', 'pera', 'laranja', 'limão', 'limao', 'abacate',
      'morango', 'mirtilo', 'framboesa', 'ananás', 'ananas', 'melancia', 'melão', 'melao',
      'alho', 'cebola', 'batata', 'cenoura', 'pimento', 'pepino', 'tomate',
      'alface', 'espinafre', 'couve', 'brócolos', 'brocolos', 'milho', 'ervilha',
      'abobrinha', 'beringela', 'abóbora', 'abobora', 'courgette', 'feijão verde',
      'salada', 'mix', 'hortaliça', 'fruta', 'legume', 'verdura',
    ],
  },
  {
    category: 'Laticínios / Frigorífico',
    keywords: [
      'leite', 'queijo', 'manteiga', 'iogurte', 'yogurt', 'yoghurt',
      'natas', 'creme', 'ovo', 'ovos',
      'carne picada',
    ],
  },
  {
    category: 'Enlatados / Bebidas',
    keywords: [
      'atum', 'grão', 'grao',
      'azeitona', 'cogumelo', 'tomate pelado', 'polpa', 'passata',
      'sumo', 'água', 'agua', 'refrigerante', 'cerveja', 'vinho',
      'compal', 'ice tea', 'pepsi', 'coca', 'fanta', 'sprite', 'água tónica',
    ],
  },
  {
    category: 'Charcutaria / Secos / Snacks',
    keywords: [
      'fiambre', 'presunto', 'chouriço', 'chorizo', 'salame', 'mortadela',
      'tosta', 'biscuit', 'chocolate', 'gomas',
      'batatas fritas', 'chips', 'snack', 'frutos secos', 'amendoim',
      'pipocas', 'sobremesa',
    ],
  },
  {
    category: 'Casa / Limpeza / Higiene',
    keywords: [
      'detergente', 'sabão', 'sabao', 'amaciador', 'limpador', 'desinfetante',
      'papel higiénico', 'papel higienico', 'papel cozinha', 'guardanapo',
      'sacos lixo', 'saco lixo', 'alumínio', 'aluminio', 'filme', 'película',
      'pasta dentes', 'escova dentes', 'champô', 'shampoo', 'condicionador',
      'gel banho', 'sabonete', 'desodorizante', 'pasta', 'escova',
      'razer', 'lâmina', 'lamina', 'espuma barbear',
    ],
  },
  {
    category: 'Congelados',
    keywords: [
      'gelado', 'sorvete', 'pizza', 'lasanha',
      'nuggets', 'legumes congelados',
      'massa congelada', 'pão congelado', 'pao congelado',
      'torta', 'empada',
    ],
  },
  {
    category: 'Peixaria',
    keywords: [
      'salmão', 'salmao', 'bacalhau', 'sardinha', 'carapau',
      'linguado', 'robalo', 'dourada', 'corvina', 'pescada',
      'camarão', 'camarao', 'lagosta', 'caranguejo', 'ameijoa', 'mexilhão',
      'lula', 'polvo', 'choco', 'pota', 'peixe', 'marisco',
    ],
  },
  {
    category: 'Talho',
    keywords: [
      'frango', 'peru', 'porco', 'vaca', 'novilho', 'cordeiro',
      'costeleta', 'bife', 'escalope', 'almondega', 'almôndega',
      'peito', 'coxa', 'asa', 'file', 'filé', 'entrecosto',
      'salsicha', 'bacon', 'hambúrguer', 'hamburguer', 'burger',
    ],
  },
  {
    category: 'Padaria',
    keywords: [
      'pão', 'pao', 'croissant', 'bolo', 'tarte', 'pastel', 'rissol',
      'pão de forma', 'pao de forma', 'brioce', 'brioche', 'baguete',
      'pão integral', 'pao integral', 'pão centeio', 'pao centeio',
      'muffin', 'donut', 'bolacha', 'biscoito',
    ],
  },
];

export function autoCategorize(itemName: string): Category {
  const normalized = itemName.toLowerCase().trim();
  
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }
  
  return 'Outros';
}

export function suggestItems(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  
  const commonItems = [
    'Pão de forma', 'Leite meio-gordo', 'Ovos', 'Manteiga', 'Queijo',
    'Bananas', 'Maçãs', 'Tomates', 'Cebolas', 'Batatas',
    'Arroz', 'Massa esparguete', 'Azeite', 'Sal', 'Açúcar',
    'Frango', 'Carne picada', 'Peito de peru',
    'Atum em lata', 'Sardinhas', 'Milho doce',
    'Papel higiénico', 'Detergente loiça', 'Amaciador roupa',
    'Sumo de laranja', 'Água', 'Coca-Cola',
  ];
  
  return commonItems.filter(item => 
    item.toLowerCase().includes(normalized)
  ).slice(0, 5);
}

export function getCategoryEmoji(category: Category): string {
  const emojis: Record<Category, string> = {
    'Mercearia / Básicos': '🥫',
    'Hortofrutícolas': '🥬',
    'Laticínios / Frigorífico': '🥛',
    'Enlatados / Bebidas': '🥤',
    'Charcutaria / Secos / Snacks': '🥓',
    'Casa / Limpeza / Higiene': '🧼',
    'Congelados': '🧊',
    'Peixaria': '🐟',
    'Talho': '🥩',
    'Padaria': '🥖',
    'Outros': '📦',
  };
  return emojis[category] || '📦';
}

export function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    'need': '🔴',
    'have': '✅',
    'running-low': '🟡',
    'not-needed': '⚪',
    'too-expensive': '💰',
    '': '⚪',
  };
  return emojis[status] || '⚪';
}
