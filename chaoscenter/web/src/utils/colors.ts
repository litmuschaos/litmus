import { Color } from '@harnessio/design-system';

interface colorPalette {
  primary: Color;
  background: Color;
}

export function getColorBasedOnResilienceScore(score: number | undefined): colorPalette {
  if (score !== undefined) {
    if (score === 100) {
      return {
        primary: Color.GREEN_700,
        background: Color.LIME_50
      };
    } else if (score < 100 && score > 0) {
      return {
        primary: Color.ORANGE_500,
        background: Color.ORANGE_100
      };
    } else
      return {
        primary: Color.RED_500,
        background: Color.RED_50
      };
  } else
    return {
      primary: Color.GREY_700,
      background: Color.PRIMARY_BG
    };
}
