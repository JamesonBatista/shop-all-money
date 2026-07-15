import type { Product } from '../types'

export const PRODUCTS: Product[] = [
  // Rolex
  {
    id: 'rx-daytona',
    storeId: 'rolex',
    name: 'Cosmograph Daytona',
    description: 'Cronógrafo icônico em ouro amarelo 18k com pulseira Oyster.',
    price: 285000,
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rx-submariner',
    storeId: 'rolex',
    name: 'Submariner Date',
    description: 'Lenda dos oceanos em aço Oystersteel com luneta Cerachrom.',
    price: 98000,
    image:
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rx-daydate',
    storeId: 'rolex',
    name: 'Day-Date 40',
    description: 'O relógio dos presidentes — ouro Everose e mostrador fluted.',
    price: 320000,
    image:
      'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rx-gmt',
    storeId: 'rolex',
    name: 'GMT-Master II',
    description: 'Viajante global com luneta bilux e calibre 3285.',
    price: 115000,
    image:
      'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=800&q=80',
  },

  // Patek
  {
    id: 'pp-nautilus',
    storeId: 'patek',
    name: 'Nautilus 5711',
    description: 'Ícone do design esportivo-elegante em aço.',
    price: 890000,
    image:
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pp-calatrava',
    storeId: 'patek',
    name: 'Calatrava 5227',
    description: 'Elegância discreta com fundo de couro e caixa em ouro.',
    price: 245000,
    image:
      'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pp-grand',
    storeId: 'patek',
    name: 'Grand Complications',
    description: 'Complicações eternas para colecionadores exigentes.',
    price: 1250000,
    image:
      'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=800&q=80',
  },

  // AP
  {
    id: 'ap-royal',
    storeId: 'ap',
    name: 'Royal Oak 15500',
    description: 'Bezel octogonal e pulseira integrada — o manifesto AP.',
    price: 210000,
    image:
      'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ap-offshore',
    storeId: 'ap',
    name: 'Royal Oak Offshore',
    description: 'Presença robusta para quem vive no extremo.',
    price: 275000,
    image:
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ap-code',
    storeId: 'ap',
    name: 'Code 11.59',
    description: 'Arquitetura contemporânea entre tradição e inovação.',
    price: 198000,
    image:
      'https://images.unsplash.com/photo-1533139502658-0198f574d8b1?auto=format&fit=crop&w=800&q=80',
  },

  // Omega
  {
    id: 'om-speedmaster',
    storeId: 'omega',
    name: 'Speedmaster Moonwatch',
    description: 'O relógio que foi à Lua — cronógrafo lendário.',
    price: 42000,
    image:
      'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'om-seamaster',
    storeId: 'omega',
    name: 'Seamaster Diver 300M',
    description: 'Mergulho e estilo Bond em aço e cerâmica.',
    price: 38000,
    image:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'om-constellation',
    storeId: 'omega',
    name: 'Constellation',
    description: 'Elegância celestial com braces de diamante.',
    price: 56000,
    image:
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
  },

  // Cartier watches
  {
    id: 'ct-tank',
    storeId: 'cartier-watches',
    name: 'Tank Must',
    description: 'Silhueta retangular icônica desde 1917.',
    price: 28500,
    image:
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ct-santos',
    storeId: 'cartier-watches',
    name: 'Santos de Cartier',
    description: 'O pioneiro dos relógios de pulso aviador.',
    price: 72000,
    image:
      'https://images.unsplash.com/photo-1609587312208-cea68a4e9e5e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ct-ballon',
    storeId: 'cartier-watches',
    name: 'Ballon Bleu',
    description: 'Curvas suaves e coroa safira azul característica.',
    price: 48500,
    image:
      'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?auto=format&fit=crop&w=800&q=80',
  },

  // Atelier Noir
  {
    id: 'an-casaco',
    storeId: 'atelier-noir',
    name: 'Casaco Oversized Cashmere',
    description: 'Cashmere italiano, corte estruturado e forro de seda.',
    price: 18500,
    image:
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'an-terno',
    storeId: 'atelier-noir',
    name: 'Terno Midnight',
    description: 'Dois botões em lã Super 150s com lapela peak.',
    price: 24000,
    image:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'an-vestido',
    storeId: 'atelier-noir',
    name: 'Vestido Coluna',
    description: 'Crepe fluido com drapeado assimétrico.',
    price: 12800,
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  },

  // Maison Verde
  {
    id: 'mv-linen',
    storeId: 'maison-verde',
    name: 'Conjunto Linho Toscana',
    description: 'Linho europeu com tingimento natural.',
    price: 6400,
    image:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mv-trench',
    storeId: 'maison-verde',
    name: 'Trench Orgânico',
    description: 'Gabardine sustentável com cintos artesanais.',
    price: 9200,
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mv-saia',
    storeId: 'maison-verde',
    name: 'Saia Midi Plissada',
    description: 'Seda vegetativa e caimento impecável.',
    price: 4800,
    image:
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
  },

  // Luxe Line
  {
    id: 'll-blazer',
    storeId: 'luxe-line',
    name: 'Blazer Signature',
    description: 'Alfaiataria moderna com ombros suaves.',
    price: 7800,
    image:
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'll-boots',
    storeId: 'luxe-line',
    name: 'Bota Chelsea Couro',
    description: 'Couro italiano com sola Goodyear.',
    price: 4200,
    image:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'll-bolsa',
    storeId: 'luxe-line',
    name: 'Bolsa Structured Mini',
    description: 'Couro grained e ferragens em ouro champagne.',
    price: 9500,
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  },

  // Horizon Estates
  {
    id: 'he-penthouse',
    storeId: 'horizon-estates',
    name: 'Penthouse Skyline',
    description: '480m² com terraço 360° e piscina infinita.',
    price: 18500000,
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'he-villa',
    storeId: 'horizon-estates',
    name: 'Villa Costa Atlântica',
    description: 'Terreno 5.000m² frente mar com spa privativo.',
    price: 42000000,
    image:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'he-loft',
    storeId: 'horizon-estates',
    name: 'Loft Industrial Premium',
    description: 'Pé-direito de 6m no coração criativo da cidade.',
    price: 4800000,
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
  },

  // Villa Prime
  {
    id: 'vp-mansion',
    storeId: 'villa-prime',
    name: 'Mansão Jardins',
    description: 'Arquitetura neoclássica com jardim paisagístico.',
    price: 28000000,
    image:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cd00?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'vp-chalet',
    storeId: 'villa-prime',
    name: 'Chalé Alpino',
    description: 'Madeira e pedra com lareira central e vista neve.',
    price: 12500000,
    image:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'vp-island',
    storeId: 'villa-prime',
    name: 'Casa Ilha Privativa',
    description: 'Acesso exclusivo por heliponto e marina.',
    price: 75000000,
    image:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
  },

  // Studio Form
  {
    id: 'sf-sofa',
    storeId: 'studio-form',
    name: 'Sofá Modular Cloud',
    description: 'Módulos reconfiguráveis em linho belga.',
    price: 32000,
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sf-mesa',
    storeId: 'studio-form',
    name: 'Mesa Jantar Nogal',
    description: 'Tábua única de nogueira americana, 3,2m.',
    price: 18500,
    image:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sf-poltrona',
    storeId: 'studio-form',
    name: 'Poltrona Lounge',
    description: 'Couro full-grain e estrutura em bronze escovado.',
    price: 14200,
    image:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
  },

  // Casa Objeto
  {
    id: 'co-estante',
    storeId: 'casa-objeto',
    name: 'Estante Escultural',
    description: 'Aço e madeira maciça, peça única numerada.',
    price: 9800,
    image:
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'co-luminaria',
    storeId: 'casa-objeto',
    name: 'Luminária Arc Grande',
    description: 'Arco de mármore e latão com difusor opalino.',
    price: 7600,
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'co-buffet',
    storeId: 'casa-objeto',
    name: 'Buffet Mid-Century',
    description: 'Restauração certificada de peça anos 60.',
    price: 11200,
    image:
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80',
  },

  // Apex Tech
  {
    id: 'at-laptop',
    storeId: 'apex-tech',
    name: 'Notebook Ultra Pro 16',
    description: 'Chip de última geração, tela mini-LED 120Hz.',
    price: 28900,
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'at-phone',
    storeId: 'apex-tech',
    name: 'Smartphone Titanium X',
    description: 'Chassi em titânio e câmera computacional avançada.',
    price: 12400,
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'at-audio',
    storeId: 'apex-tech',
    name: 'Fones Reference ANC',
    description: 'Cancelamento ativo e drivers beryllium.',
    price: 4800,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },

  // Nova Devices
  {
    id: 'nd-watch',
    storeId: 'nova-devices',
    name: 'Wearable Health Elite',
    description: 'Sensores clínicos e autonomia de 7 dias.',
    price: 5200,
    image:
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'nd-tablet',
    storeId: 'nova-devices',
    name: 'Tablet Creator 13',
    description: 'Tela OLED e caneta com 10.000 níveis de pressão.',
    price: 9800,
    image:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'nd-cam',
    storeId: 'nova-devices',
    name: 'Câmera Mirrorless Pro',
    description: 'Sensor full-frame e estabilização de 8 stops.',
    price: 24600,
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  },

  // Atelier Brilho
  {
    id: 'ab-anel',
    storeId: 'atelier-brilho',
    name: 'Anel Solitário 2ct',
    description: 'Diamante D VS1 com certificação GIA.',
    price: 185000,
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ab-colar',
    storeId: 'atelier-brilho',
    name: 'Colar Riviera',
    description: 'Safiras e diamantes em ouro branco 18k.',
    price: 92000,
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ab-brinco',
    storeId: 'atelier-brilho',
    name: 'Brincos Chandelier',
    description: 'Cascata de diamantes para ocasiões memoráveis.',
    price: 68000,
    image:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  },

  // Ouro Royal
  {
    id: 'or-pulseira',
    storeId: 'ouro-royal',
    name: 'Pulseira Elos Ouro',
    description: 'Ouro amarelo 18k, 45g, fecho seguro.',
    price: 28500,
    image:
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'or-alianca',
    storeId: 'ouro-royal',
    name: 'Par de Alianças',
    description: 'Acabamento fosco e polido com diamantes laterais.',
    price: 15600,
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'or-pingente',
    storeId: 'ouro-royal',
    name: 'Pingente Medalhão',
    description: 'Gravação personalizada em ouro rose.',
    price: 8900,
    image:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
  },

  // Velocity Garage
  {
    id: 'vg-gt',
    storeId: 'velocity-garage',
    name: 'Supercar GT-R Edition',
    description: '720cv, carbon fiber body, pacote track.',
    price: 2850000,
    image:
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'vg-spider',
    storeId: 'velocity-garage',
    name: 'Spider Open Top',
    description: 'Conversível V12 com escapamento titanium.',
    price: 4200000,
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'vg-hyper',
    storeId: 'velocity-garage',
    name: 'Hypercar One-Off',
    description: 'Exemplar único numerado, 1.000+ cv híbrido.',
    price: 18500000,
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
  },

  // Grand Tour
  {
    id: 'gt-sedan',
    storeId: 'grand-tour',
    name: 'Sedan Executive Long',
    description: 'Cabine traseira lounge e isolamento acústico.',
    price: 980000,
    image:
      'https://images.unsplash.com/photo-1555215695-3003735ddad7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gt-suv',
    storeId: 'grand-tour',
    name: 'SUV Armored Soft',
    description: 'Proteção discreta e conforto first-class.',
    price: 1450000,
    image:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gt-coupe',
    storeId: 'grand-tour',
    name: 'Coupé Grand Turismo',
    description: '4 lugares, motor biturbo e interior em madeira.',
    price: 1680000,
    image:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  },

  // Galeria Norte
  {
    id: 'gn-abstract',
    storeId: 'galeria-norte',
    name: 'Abstrato Horizonte',
    description: 'Óleo sobre tela 180×120cm, artista contemporâneo.',
    price: 85000,
    image:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gn-foto',
    storeId: 'galeria-norte',
    name: 'Fotografia Edition 1/5',
    description: 'Impressão em metal, moldura flutuante.',
    price: 24000,
    image:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gn-escultura',
    storeId: 'galeria-norte',
    name: 'Escultura Bronze',
    description: 'Fundição artesanal, 85cm de altura.',
    price: 62000,
    image:
      'https://images.unsplash.com/photo-1561214115-f2f94176d962?auto=format&fit=crop&w=800&q=80',
  },

  // Atelier Canvas
  {
    id: 'ac-paisagem',
    storeId: 'atelier-canvas',
    name: 'Paisagem Dourada',
    description: 'Técnica mista com pigmentos metálicos.',
    price: 38000,
    image:
      'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ac-retrato',
    storeId: 'atelier-canvas',
    name: 'Retrato Encomendado',
    description: 'Retrato a óleo sob medida, 90 dias.',
    price: 45000,
    image:
      'https://images.unsplash.com/photo-1577720643272-2652308058aa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ac-serie',
    storeId: 'atelier-canvas',
    name: 'Série Triplo Painel',
    description: 'Tríptico modular para paredes amplas.',
    price: 72000,
    image:
      'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80',
  },
]

export function getProductsByStore(storeId: string): Product[] {
  return PRODUCTS.filter((p) => p.storeId === storeId)
}

export function getProductById(productId: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === productId)
}
