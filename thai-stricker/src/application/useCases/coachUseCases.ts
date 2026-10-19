import type { CoachTip } from "../../types/domain";

export function getCoachTipAtIndex(coachTips: CoachTip[], index: number) {
  return coachTips[index];
}

export function selectRandomCoachTip(coachTips: CoachTip[]) {
  if (!coachTips.length) return undefined;
  return coachTips[Math.floor(Math.random() * coachTips.length)];
}
