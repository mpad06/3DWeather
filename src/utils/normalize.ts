/**
 * Brings text into one canonical form so that different spellings compare
 * equal. "München", "Muenchen" and "munchen" all become "munchen".
 *
 * Steps:
 * 1. lower case
 * 2. "ß" → "ss"
 * 3. remove accents: NFD splits "ü" into "u" plus a combining mark, the
 *    regular expression then deletes all combining marks
 * 4. the transcriptions "ae", "oe", "ue" → "a", "o", "u", so they end up in
 *    the same form as the umlauts from step 3
 * 5. everything that is not a letter or digit (brackets, hyphens) → one space
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
