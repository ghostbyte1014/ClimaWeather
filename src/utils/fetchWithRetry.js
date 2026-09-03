/**
 * Fetches a URL with exponential backoff retries and timeout support.
 */
export async function fetchWithRetry(url, options = {}, retries = 3, backoffMs = 500) {
  const { timeout = 8000, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) {
        throw err;
      }
      // Wait with exponential backoff before retrying
      await new Promise((resolve) => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
    }
  }
}
