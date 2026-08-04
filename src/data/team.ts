export interface Member {
  name: string;
  role: string;
  photo: string;
  linkedin?: string;
}

const IMG = '/assets/images';

export const team: Member[] = [
  { name: 'Serhii Potapov', role: 'Founder & Investor', photo: `${IMG}/d91DUjSiNKnjiyjQjx4KyrS6mw.png`, linkedin: 'https://www.linkedin.com/in/sergii-potapov-53520528/' },
  { name: 'Oleksii Panasiuk', role: 'Strategic Advisor', photo: `${IMG}/w8f009ZPfXkMYRYWgHPHNbY6Hqw.jpeg`, linkedin: 'https://www.linkedin.com/in/oleksii-panasiuk-57a75a12/' },
  { name: 'Kostenko Olena', role: 'Head of Operations', photo: `${IMG}/F191QRaQglqaTirpW32LJj1nB0.jpg`, linkedin: 'https://www.linkedin.com/in/olena-kostenko-8053b1166/' },
  { name: 'Vitalii Odzhykovskyi', role: 'External Advisor', photo: `${IMG}/KW0bXthft1Yh10pSIOxS9U6vk.png`, linkedin: 'https://www.linkedin.com/in/vitaliy-odzhykovskyy-3b096323/' },
  { name: 'Maryna Palamarchuk', role: 'Head of Legal', photo: `${IMG}/dPqpOk1hFAfd4aXFVCcGExOe0.webp`, linkedin: 'https://www.linkedin.com/in/maryna-p-9713841a8/' },
  { name: 'Stanislav Konovalov', role: 'CFO', photo: `${IMG}/GThiFcOvZFJQdVZnNSMIXX7D90.png`, linkedin: 'https://www.linkedin.com/in/stanislav-konovalov-83310647/' },
];
