export type CoachKnowledge = {
  technique: string;
  discipline: "Muay Thai";
  stance: string;
  source: { title: string; pages: number[]; status: "validated-against-source" };
  principles: string[];
  commonMistakes: string[];
  focusPoints: string[];
  explanation: string;
  variations: string[];
  safetyNote: string;
};

export const coachKnowledge: CoachKnowledge[] = [{
  technique: "JAB",
  discipline: "Muay Thai",
  stance: "Orthodoxe, main gauche avant",
  source: {
    title: "Mastering Muay Thai Kick-Boxing - MMA-Proven Techniques",
    pages: [35, 36],
    status: "validated-against-source",
  },
  principles: [
    "Avancer pendant la frappe lorsque la distance le permet.",
    "Frapper avec le poing avant en ligne droite vers la hauteur des yeux.",
    "Faire partir le poing directement depuis la garde.",
    "Amener légèrement l'épaule avant vers l'avant pour protéger la joue et le menton.",
    "Garder la main arrière près de la joue.",
    "Frapper avec les deux premiers phalanges, alignés avec le poignet et l'épaule.",
    "Revenir en garde Muay Thai après la frappe.",
  ],
  commonMistakes: [
    "Baisser la main arrière pendant le jab.",
    "Laisser le menton ou la joue avant exposés.",
    "Frapper en poussant au lieu d'utiliser un mouvement rapide et claquant.",
    "Perdre son équilibre en avançant.",
    "Oublier de revenir en garde après l'extension.",
  ],
  focusPoints: [
    "Garder les pieds stables et la posture équilibrée.",
    "Maintenir l'épaule avant légèrement relevée.",
    "Conserver la main arrière près de la joue.",
    "Chercher la précision avant la puissance.",
    "Ramener rapidement le poing vers la garde.",
  ],
  explanation: "Le jab est une frappe rapide et directe qui sert à toucher, mesurer la distance et préparer les actions suivantes.",
  variations: ["Depuis une position stationnaire.", "En avançant.", "Depuis différentes directions de déplacement selon la distance et le positionnement."],
  safetyNote: "Travailler lentement au début et privilégier l'équilibre, l'alignement et le retour en garde.",
}];

export function getCoachKnowledgeForTechniqueNames(names: string[]) {
  const normalizedNames = names.map((name) => name.trim().toLocaleUpperCase());
  return coachKnowledge.filter((entry) => normalizedNames.includes(entry.technique));
}
