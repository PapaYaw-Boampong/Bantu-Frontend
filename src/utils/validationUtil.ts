export function mapProficiencyToNumber(proficiency: string): number {
  const mapping: Record<string, number> = {
    beginner: 3,
    intermediate: 5,
    advanced: 7,
    native: 9,
  };

  // Normalize and return mapped value or 0 if unrecognized
  return mapping[proficiency.toLowerCase()] ?? 0;
}


