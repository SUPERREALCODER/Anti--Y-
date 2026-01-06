
import { SkillTree } from './types';

export const INITIAL_SKILL_TREE: SkillTree = {
  id: 'st-master',
  name: 'Deep Learning Nexus',
  nodes: [
    // PHYSICS BRANCH
    {
      id: 'p1',
      title: 'The Map of Physics',
      description: 'A birds-eye view of the entire field of physics.',
      ytId: 'ZihywtixUhe',
      level: 1,
      subject: 'Physics',
      prerequisites: [],
      duration: 840
    },
    {
      id: 'p2',
      title: 'Newtonian Mechanics',
      description: 'Laws of motion, gravity, and the clockwork universe.',
      ytId: 'kS57nASer60',
      level: 2,
      subject: 'Physics',
      prerequisites: ['p1'],
      duration: 600
    },
    {
      id: 'p4',
      title: 'Special Relativity',
      description: 'Einstein’s revolution in space and time.',
      ytId: 'ev9zrt__lec',
      level: 3,
      subject: 'Physics',
      prerequisites: ['p2'],
      duration: 900
    },

    // NEUROSCIENCE BRANCH
    {
      id: 'n1',
      title: 'Neuroscience 101',
      description: 'Understanding the basic architecture of the human brain.',
      ytId: '6qS83wD29PY',
      level: 1,
      subject: 'Neuroscience',
      prerequisites: [],
      duration: 720
    },
    {
      id: 'n2',
      title: 'The Dopamine Circuit',
      description: 'How reward systems drive behavior and addiction.',
      ytId: 'X9S6XfC0-I8',
      level: 2,
      subject: 'Neuroscience',
      prerequisites: ['n1'],
      duration: 600
    },

    // PHILOSOPHY BRANCH
    {
      id: 'phi1',
      title: 'Epistemology: How we Know',
      description: 'The study of knowledge and justified belief.',
      ytId: 'L45Q1_psDqk',
      level: 1,
      subject: 'Philosophy',
      prerequisites: [],
      duration: 540
    },
    {
      id: 'phi2',
      title: 'The Existentialist Crisis',
      description: 'Exploring freedom, choice, and responsibility in a chaotic world.',
      ytId: 'YaDvRdLMkHs',
      level: 2,
      subject: 'Philosophy',
      prerequisites: ['phi1'],
      duration: 660
    }
  ]
};

export const GATEKEEPER_DURATION = 60; // 60 seconds as requested
