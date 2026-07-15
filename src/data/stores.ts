import type { Store } from '../types'

export const STORES: Store[] = [
  // Relógios — maisons de luxo
  {
    id: 'rolex',
    categoryId: 'relogios',
    name: 'Rolex',
    tagline: 'A Crown for Every Achievement',
    description: 'Excelência suíça em cronometragem desde 1905.',
    logoInitials: 'RX',
    heroImage:
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Reservar peça',
      style: 'solid',
    },
    theme: {
      primary: '#006039',
      secondary: '#a37e2c',
      accent: '#c4a35a',
      background: '#0b1f17',
      text: '#f4f0e6',
      surface: '#132e22',
      fontDisplay: '"Cormorant Garamond", serif',
      pattern: 'radial-gradient(circle at 20% 20%, rgba(196,163,90,0.12), transparent 40%)',
    },
  },
  {
    id: 'patek',
    categoryId: 'relogios',
    name: 'Patek Philippe',
    tagline: 'You never actually own a Patek Philippe',
    description: 'Haute horlogerie genebra — você apenas cuida dela para a próxima geração.',
    logoInitials: 'PP',
    heroImage:
      'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Adquirir legado',
      style: 'outline',
    },
    theme: {
      primary: '#1a2744',
      secondary: '#8b7355',
      accent: '#d4af37',
      background: '#0c1220',
      text: '#f7f3ea',
      surface: '#162033',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },
  {
    id: 'ap',
    categoryId: 'relogios',
    name: 'Audemars Piguet',
    tagline: 'To Break the Rules, You Must First Master Them',
    description: 'Royal Oak e a ousadia do design contemporâneo.',
    logoInitials: 'AP',
    heroImage:
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Levar Royal Oak',
      style: 'square',
    },
    theme: {
      primary: '#1c1c1c',
      secondary: '#6e6e6e',
      accent: '#b8b8b8',
      background: '#0a0a0a',
      text: '#f2f2f2',
      surface: '#171717',
      fontDisplay: '"Outfit", sans-serif',
    },
  },
  {
    id: 'omega',
    categoryId: 'relogios',
    name: 'Omega',
    tagline: 'Precision. Passion. Performance.',
    description: 'Do espaço à Fórmula 1 — precisão que inspira.',
    logoInitials: 'Ω',
    heroImage:
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Comprar agora',
      style: 'pill',
    },
    theme: {
      primary: '#003366',
      secondary: '#c0a062',
      accent: '#e8d5a3',
      background: '#061525',
      text: '#f5f7fa',
      surface: '#0d2238',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },
  {
    id: 'cartier-watches',
    categoryId: 'relogios',
    name: 'Cartier',
    tagline: 'Jeweller of Kings',
    description: 'A arte da joalheria aplicada à relojoaria.',
    logoInitials: 'CT',
    heroImage:
      'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Selecionar joia',
      style: 'underline',
    },
    theme: {
      primary: '#8b1e1e',
      secondary: '#1a1a1a',
      accent: '#f0e6d2',
      background: '#1a0c0c',
      text: '#faf6f0',
      surface: '#2a1414',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },

  // Roupas
  {
    id: 'atelier-noir',
    categoryId: 'roupas',
    name: 'Atelier Noir',
    tagline: 'Silhuetas que definem presença',
    description: 'Alta costura contemporânea com corte impecável.',
    logoInitials: 'AN',
    heroImage:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Encomendar',
      style: 'square',
    },
    theme: {
      primary: '#111111',
      secondary: '#3d3d3d',
      accent: '#e8e4dc',
      background: '#0d0d0d',
      text: '#f5f2eb',
      surface: '#1a1a1a',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },
  {
    id: 'maison-verde',
    categoryId: 'roupas',
    name: 'Maison Verde',
    tagline: 'Elegância natural',
    description: 'Tecidos nobres e paleta orgânica.',
    logoInitials: 'MV',
    heroImage:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Adicionar look',
      style: 'pill',
    },
    theme: {
      primary: '#1f3d2f',
      secondary: '#6b8f71',
      accent: '#d9c7a3',
      background: '#0f1f18',
      text: '#f3efe6',
      surface: '#1a2e24',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },
  {
    id: 'luxe-line',
    categoryId: 'roupas',
    name: 'Luxe Line',
    tagline: 'Ready-to-wear de elite',
    description: 'Peças icônicas para o cotidiano sofisticado.',
    logoInitials: 'LL',
    heroImage:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Levar peça',
      style: 'solid',
    },
    theme: {
      primary: '#2c1810',
      secondary: '#8b5a3c',
      accent: '#f0d9c0',
      background: '#16100c',
      text: '#faf4ee',
      surface: '#241810',
      fontDisplay: '"Outfit", sans-serif',
    },
  },

  // Casas
  {
    id: 'horizon-estates',
    categoryId: 'casas',
    name: 'Horizon Estates',
    tagline: 'Vista e exclusividade',
    description: 'Propriedades com arquitetura icônica e localização privilegiada.',
    logoInitials: 'HE',
    heroImage:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Agendar visita',
      style: 'outline',
    },
    theme: {
      primary: '#1e3a5f',
      secondary: '#5a7a9a',
      accent: '#c9d6e3',
      background: '#0c1520',
      text: '#eef3f8',
      surface: '#152536',
      fontDisplay: '"Outfit", sans-serif',
    },
  },
  {
    id: 'villa-prime',
    categoryId: 'casas',
    name: 'Villa Prime',
    tagline: 'Residências que contam histórias',
    description: 'Mansões e penthouses curadas para o topo.',
    logoInitials: 'VP',
    heroImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Reservar imóvel',
      style: 'solid',
    },
    theme: {
      primary: '#2a2520',
      secondary: '#8a7355',
      accent: '#e6d5b8',
      background: '#141210',
      text: '#f7f1e8',
      surface: '#221e1a',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },

  // Móveis
  {
    id: 'studio-form',
    categoryId: 'moveis',
    name: 'Studio Form',
    tagline: 'Forma segue a emoção',
    description: 'Mobiliário autoral com materiais nobres.',
    logoInitials: 'SF',
    heroImage:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Comprar design',
      style: 'pill',
    },
    theme: {
      primary: '#3e2723',
      secondary: '#8d6e63',
      accent: '#d7ccc8',
      background: '#1a1210',
      text: '#f5ebe6',
      surface: '#2a1c18',
      fontDisplay: '"Outfit", sans-serif',
    },
  },
  {
    id: 'casa-objeto',
    categoryId: 'moveis',
    name: 'Casa Objeto',
    tagline: 'Peças que habitam o tempo',
    description: 'Design brasileiro e internacional lado a lado.',
    logoInitials: 'CO',
    heroImage:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Levar para casa',
      style: 'underline',
    },
    theme: {
      primary: '#2d3436',
      secondary: '#636e72',
      accent: '#dfe6e9',
      background: '#121516',
      text: '#f1f2f3',
      surface: '#1e2426',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },

  // Eletrônicos
  {
    id: 'apex-tech',
    categoryId: 'eletronicos',
    name: 'Apex Tech',
    tagline: 'Performance sem concessões',
    description: 'Gadgets e sistemas de ponta para quem exige o máximo.',
    logoInitials: 'AT',
    heroImage:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Adicionar ao kit',
      style: 'square',
    },
    theme: {
      primary: '#0b3d91',
      secondary: '#1e88e5',
      accent: '#90caf9',
      background: '#061018',
      text: '#e8f1ff',
      surface: '#0c1c2c',
      fontDisplay: '"Outfit", sans-serif',
    },
  },
  {
    id: 'nova-devices',
    categoryId: 'eletronicos',
    name: 'Nova Devices',
    tagline: 'O futuro na palma da mão',
    description: 'Lançamentos exclusivos e edições limitadas.',
    logoInitials: 'ND',
    heroImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Comprar tech',
      style: 'pill',
    },
    theme: {
      primary: '#1a237e',
      secondary: '#3949ab',
      accent: '#c5cae9',
      background: '#0a0e24',
      text: '#eef0ff',
      surface: '#12183a',
      fontDisplay: '"Outfit", sans-serif',
    },
  },

  // Joias
  {
    id: 'atelier-brilho',
    categoryId: 'joias',
    name: 'Atelier Brilho',
    tagline: 'Luz em cada faceta',
    description: 'Diamantes e pedras preciosas com certificação internacional.',
    logoInitials: 'AB',
    heroImage:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Reservar joia',
      style: 'outline',
    },
    theme: {
      primary: '#4a1942',
      secondary: '#9b4d7a',
      accent: '#f5d0e0',
      background: '#160812',
      text: '#fdf2f7',
      surface: '#24101c',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },
  {
    id: 'ouro-royal',
    categoryId: 'joias',
    name: 'Ouro Royal',
    tagline: 'Tradição em ouro 18k',
    description: 'Joias clássicas com acabamento artesanal.',
    logoInitials: 'OR',
    heroImage:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Comprar em ouro',
      style: 'solid',
    },
    theme: {
      primary: '#5c3d1e',
      secondary: '#c9a227',
      accent: '#f5e6b8',
      background: '#1a1208',
      text: '#fff8e7',
      surface: '#2a1c0e',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },

  // Carros
  {
    id: 'velocity-garage',
    categoryId: 'carros',
    name: 'Velocity Garage',
    tagline: 'Adrenalina sob medida',
    description: 'Esportivos e hypercars com procedência garantida.',
    logoInitials: 'VG',
    heroImage:
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Reservar veículo',
      style: 'square',
    },
    theme: {
      primary: '#b71c1c',
      secondary: '#212121',
      accent: '#ffcdd2',
      background: '#100808',
      text: '#fafafa',
      surface: '#1c1010',
      fontDisplay: '"Outfit", sans-serif',
    },
  },
  {
    id: 'grand-tour',
    categoryId: 'carros',
    name: 'Grand Tour',
    tagline: 'Conforto em alta velocidade',
    description: 'GTs e sedãs de luxo para longas distâncias.',
    logoInitials: 'GT',
    heroImage:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Solicitar proposta',
      style: 'outline',
    },
    theme: {
      primary: '#263238',
      secondary: '#546e7a',
      accent: '#cfd8dc',
      background: '#0d1214',
      text: '#eceff1',
      surface: '#172025',
      fontDisplay: '"Outfit", sans-serif',
    },
  },

  // Arte
  {
    id: 'galeria-norte',
    categoryId: 'arte',
    name: 'Galeria Norte',
    tagline: 'Obras que transformam espaços',
    description: 'Arte contemporânea e edições de artistas consagrados.',
    logoInitials: 'GN',
    heroImage:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Adquirir obra',
      style: 'underline',
    },
    theme: {
      primary: '#1b3a4b',
      secondary: '#3d6b7a',
      accent: '#e6c98a',
      background: '#0b141a',
      text: '#f4efe6',
      surface: '#13222c',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },
  {
    id: 'atelier-canvas',
    categoryId: 'arte',
    name: 'Atelier Canvas',
    tagline: 'Do estúdio à sua parede',
    description: 'Pinturas originais e esculturas selecionadas.',
    logoInitials: 'AC',
    heroImage:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1400&q=80',
    cta: {
      label: 'Encomendar arte',
      style: 'pill',
    },
    theme: {
      primary: '#3e2723',
      secondary: '#a1887f',
      accent: '#efebe9',
      background: '#140e0c',
      text: '#faf6f3',
      surface: '#221814',
      fontDisplay: '"Cormorant Garamond", serif',
    },
  },
]

export function getStoresByCategory(categoryId: string): Store[] {
  return STORES.filter((s) => s.categoryId === categoryId)
}

export function getStoreById(storeId: string): Store | undefined {
  return STORES.find((s) => s.id === storeId)
}
