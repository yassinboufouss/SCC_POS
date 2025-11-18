/**
 * Simulates an asynchronous API call with a small delay.
 * @param result The data to be returned upon successful completion.
 * @returns A Promise that resolves with the result after a delay.
 */
export const simulateApiCall = <T>(result: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, 300); // 300ms delay to simulate network latency
  });
};