import { Plant } from './types';

export const INITIAL_PLANT: Plant = {
  id: '1',
  name: 'Sr. Tomatinho',
  type: 'vegetable',
  scientificName: 'Solanum lycopersicum',
  image: '🍅',
  benefits: [
    'Eu ajudo a manter seus olhos fortes!',
    'Protejo sua pele com meus antioxidantes',
    'Faço bem para o seu coração!'
  ],
  funFact: 'Você sabia que eu sou botanicamente uma fruta? Pertenço à família das solanáceas e adoro um carinho.',
  level: 1,
  xp: 20,
  xpToNextLevel: 100,
  stats: {
    water: 45,
    sun: 80,
    love: 60
  },
  diary: []
};

export const VEGETABLES_DB = [
  {
    name: 'Beterraba',
    image: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f87?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Rica em nitratos, a beterraba auxilia na circulação e oxigenação.',
    color: 'bg-pink-500'
  },
  {
    name: 'Cenoura',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Excelente fonte de betacaroteno, essencial para a saúde ocular.',
    color: 'bg-orange-500'
  },
  {
    name: 'Alface',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Possui propriedades calmantes e é rica em fibras e vitaminas.',
    color: 'bg-green-500'
  }
];

export const MOCK_SENSOR_DATA = [
  { time: '08:00', moisture: 40, light: 20, temperature: 22 },
  { time: '10:00', moisture: 35, light: 80, temperature: 24 },
  { time: '12:00', moisture: 30, light: 100, temperature: 26 },
  { time: '14:00', moisture: 25, light: 95, temperature: 27 },
  { time: '16:00', moisture: 20, light: 60, temperature: 25 },
  { time: '18:00', moisture: 60, light: 30, temperature: 23 }, // Watered
];