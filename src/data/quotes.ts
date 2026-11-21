export const quotes = [
  "If at first you dont't succeed, then maybe studying just isn't for you",
  'the reward for hard work is usually just more hard work, lets just take a nap instead',
  'Every time I think about doing work, I wait until the feeling passes, works every time',
  'Procrastination is just keeping the spirit of tomorrow alive',
  'Studying is doubting your own ability',
  'Everyone studying so hard, even if we start now, we are still gonna be behind, lets just relax',
  'Have you seen Marlon studying, no.',
  'Do you think Speed got all his money by studying?',
  'You can’t out-train your DNA, lets just start scrolling and be happy.'
];

export function pickQuote(excluding?: string) {
  const choices = quotes.filter((quote) => quote !== excluding);
  return choices[Math.floor(Math.random() * choices.length)];
}
