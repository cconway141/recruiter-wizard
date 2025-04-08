
import { UserProfile } from "./use-dropdown-options";

/**
 * Hook that returns a hardcoded list of recruiters
 * This could be expanded in the future to fetch from an API or database
 */
export function useUserOptions() {
  return {
    data: [
      { id: '1', first_name: 'Chris', last_name: null, email: 'chris@example.com', display_name: 'Chris' },
      { id: '2', first_name: 'Brandon', last_name: null, email: 'brandon@example.com', display_name: 'Brandon' },
      { id: '3', first_name: 'Rick', last_name: null, email: 'rick@example.com', display_name: 'Rick' }
    ] as UserProfile[],
    isLoading: false
  };
}
