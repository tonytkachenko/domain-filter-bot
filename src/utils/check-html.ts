import { logger } from "./logger.js";

export async function checkDomainHtml(
  url: string,
  regex: RegExp,
): Promise<boolean> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    if (html) {
      return regex.test(html);
    } else {
      return false;
    }
  } catch (error) {
    logger.warn(error);
    return false;
  }
}
