import type { QuizQuestion } from '../types'

/** Curated, general-knowledge questions. Local rules vary; explanations say so where it matters. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Where does a clean, empty glass jar usually go?',
    options: ['Glass recycling', 'Compost', 'Paper recycling', 'E-waste drop-off'],
    correctIndex: 0,
    explanation: 'Clean glass bottles and jars are generally collected for glass recycling. Check local colour-sorting rules.',
  },
  {
    id: 'q2',
    prompt: 'What is the safest place for used AA batteries?',
    options: ['General bin', 'Battery collection point', 'Plastic recycling', 'Down the drain'],
    correctIndex: 1,
    explanation: 'Batteries can leak or start fires in bins and trucks. Use a battery collection point.',
  },
  {
    id: 'q3',
    prompt: 'A greasy pizza box is most often best treated as…',
    options: ['Clean paper recycling', 'Glass recycling', 'Food-soiled: compost or general waste', 'Metal recycling'],
    correctIndex: 2,
    explanation: 'Grease contaminates paper fibre. Many places want the clean lid recycled and the soiled part composted or binned; check local rules.',
  },
  {
    id: 'q4',
    prompt: 'What should you do before recycling a plastic food tub?',
    options: ['Set it on fire', 'Empty and rinse it', 'Fill it with water', 'Crush it into glass bin'],
    correctIndex: 1,
    explanation: 'Food residue can contaminate other recyclables. A quick rinse helps.',
  },
  {
    id: 'q5',
    prompt: 'Banana peels and coffee grounds belong in…',
    options: ['Organic / compost', 'Plastic recycling', 'E-waste', 'Metal recycling'],
    correctIndex: 0,
    explanation: 'Fruit peels and coffee grounds are compostable organic waste.',
  },
  {
    id: 'q6',
    prompt: 'What is the right way to dispose of an old phone?',
    options: ['Household bin', 'Compost bin', 'E-waste collection or take-back', 'Glass bank'],
    correctIndex: 2,
    explanation: 'Phones contain batteries and valuable materials. Use e-waste collection or a retailer take-back, and wipe your data first.',
  },
  {
    id: 'q7',
    prompt: 'Which item is usually accepted in metal recycling?',
    options: ['Empty drink can', 'Used tissue', 'Banana peel', 'Broken ceramic mug'],
    correctIndex: 0,
    explanation: 'Empty aluminium and steel cans are widely recycled. Tissues, food and ceramics are not metal.',
  },
  {
    id: 'q8',
    prompt: 'You have a worn-out cotton t-shirt. What is a good first choice?',
    options: ['Paper recycling', 'Textile bank or donation point', 'Glass recycling', 'Burn it'],
    correctIndex: 1,
    explanation: 'Textile banks and reuse or take-back schemes are better than bins where available. Check what your area accepts.',
  },
  {
    id: 'q9',
    prompt: 'Why is putting non-recyclables in the recycling bin a problem?',
    options: ['It makes the bin heavier', 'It can contaminate good recyclables', 'Nothing, it is always sorted out', 'It attracts insects only'],
    correctIndex: 1,
    explanation: 'Contamination can cause whole batches of recyclables to be rejected.',
  },
  {
    id: 'q10',
    prompt: 'How should you handle broken glass?',
    options: ['Throw it loose in recycling', 'Wrap it securely and follow local guidance', 'Pick it up with bare hands', 'Put it in compost'],
    correctIndex: 1,
    explanation: 'Broken glass cuts. Wrap it securely and follow your local rules; many places do not accept it in glass recycling.',
  },
  {
    id: 'q11',
    prompt: 'Which is typically NOT accepted in regular paper recycling?',
    options: ['Clean cardboard box', 'Newspaper', 'Wet, food-soiled paper', 'Office paper'],
    correctIndex: 2,
    explanation: 'Wet or food-soiled paper is generally rejected because it ruins the fibres.',
  },
  {
    id: 'q12',
    prompt: 'A swollen or damaged phone battery should…',
    options: ['Be squeezed flat', 'Be thrown in the bin', 'Be kept away from heat and reported to local waste authorities', 'Be opened to check inside'],
    correctIndex: 2,
    explanation: 'Damaged lithium batteries can ignite. Keep them away from heat, never open or puncture them, and ask your local authority for advice.',
  },
]

export const QUESTIONS_PER_ROUND = 5
export const POINTS_PER_CORRECT = 100
