export interface QA {
  q: string;
  a: string;
}
export interface FaqGroup {
  title: string;
  items: QA[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: 'For Founders',
    items: [
      { q: 'What stage do you invest in?', a: 'We back companies with early revenue, strong MVPs, and signs of market pull - usually from seed to Series A.' },
      { q: 'How much do you typically invest?', a: 'Our initial checks range from €100k to €500k, with flexibility for follow-on rounds.' },
      { q: 'Do you lead rounds?', a: 'Yes. We can lead or co-invest, depending on the opportunity and round dynamics.' },
      { q: 'What sectors do you focus on?', a: 'We invest in [SaaS / Web3 / Digital Health / Gaming etc.], but always with product-led growth potential.' },
      { q: 'How long does your decision process take?', a: '2–4 weeks from intro to decision, assuming data access and readiness.' },
      { q: 'Do you help portfolio companies beyond capital?', a: 'Yes — with strategic sparring, hiring, fundraising, and intros within our network.' },
    ],
  },
  {
    title: 'For Investors (LPs / Angels / Co-Investors)',
    items: [
      { q: 'Can I invest alongside you?', a: 'We welcome co-investors who share our long-term view and value-add approach.' },
      { q: 'What is your average holding period?', a: 'Typically 5–7 years, though we remain opportunistic on secondary exits.' },
      { q: 'How do you source deals?', a: 'Through a combination of founder referrals, ecosystem presence, and thematic scouting.' },
      { q: 'How often do you report performance?', a: 'Quarterly updates with deep dives available bi-annually.' },
    ],
  },
];
