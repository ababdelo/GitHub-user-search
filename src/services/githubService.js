// Get API key from Vite env
const GITHUB_API_KEY = import.meta.env.VITE_APP_GITHUB_API_KEY;
const API_BASE_URL = 'https://api.github.com';

// Debug: Log API key status (remove in production)
console.log('API Key exists:', !!GITHUB_API_KEY);
console.log('API Key length:', GITHUB_API_KEY?.length || 0);

// Custom error class for better error handling
class GitHubAPIError extends Error {
  constructor(message, type, status = null) {
    super(message);
    this.name = 'GitHubAPIError';
    this.type = type;
    this.status = status;
  }
}

// Helper function to handle API responses
const handleResponse = async (response, endpoint) => {
  if (!response.ok) {
    let errorType = 'API_ERROR';
    let errorMessage = `GitHub API error: ${response.status}`;

    switch (response.status) {
      case 403:
        errorType = 'RATE_LIMIT';
        errorMessage = 'API rate limit exceeded. Please wait before making more requests.';
        break;
      case 404:
        errorType = endpoint.includes('/users/') ? 'USER_NOT_FOUND' : 'NO_RESULTS';
        errorMessage = endpoint.includes('/users/') 
          ? 'User not found or profile is private.' 
          : 'No results found for your search.';
        break;
      case 422:
        errorType = 'VALIDATION_ERROR';
        errorMessage = 'Invalid search parameters provided.';
        break;
      case 500:
      case 502:
      case 503:
        errorType = 'API_ERROR';
        errorMessage = 'GitHub servers are currently unavailable. Please try again later.';
        break;
      default:
        errorType = 'API_ERROR';
        errorMessage = `Request failed with status ${response.status}`;
    }

    throw new GitHubAPIError(errorMessage, errorType, response.status);
  }

  return response.json();
};

export const searchUsersAdvanced = async ({ username, location, minRepos, page = 1, perPage = 10 }) => {
  // Validation
  const searchParams = [];
  
  if (username?.trim()) searchParams.push(`${username.trim()} in:login`);
  if (location?.trim()) searchParams.push(`location:${location.trim()}`);
  if (minRepos && !isNaN(minRepos) && Number(minRepos) >= 0) {
    searchParams.push(`repos:>=${minRepos}`);
  }
  
  if (searchParams.length === 0) {
    throw new GitHubAPIError(
      'Please enter at least one search criteria (username, location, or minimum repositories).',
      'VALIDATION_ERROR'
    );
  }
  
  try {
    const query = searchParams.join(' ');
    const url = `${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    const headers = GITHUB_API_KEY ? { Authorization: `token ${GITHUB_API_KEY}` } : {};
    const response = await fetch(url, { headers });
    const data = await handleResponse(response, '/search/users');
    
    // Check if no results found
    if (!data.items || data.items.length === 0) {
      throw new GitHubAPIError(
        'No users found matching your search criteria. Try different search terms.',
        'NO_RESULTS'
      );
    }
    
    return data;
  } catch (error) {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new GitHubAPIError(
        'Network connection failed. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }
    
    // Re-throw our custom errors
    if (error instanceof GitHubAPIError) {
      throw error;
    }
    
    // Unknown errors
    throw new GitHubAPIError(
      'An unexpected error occurred while searching.',
      'API_ERROR'
    );
  }
};

export const getUserDetails = async (username) => {
  if (!username?.trim()) {
    throw new GitHubAPIError(
      'Username is required to fetch user details.',
      'VALIDATION_ERROR'
    );
  }

  try {
    const url = `${API_BASE_URL}/users/${username.trim()}`;
    const headers = GITHUB_API_KEY ? { Authorization: `token ${GITHUB_API_KEY}` } : {};
    const response = await fetch(url, { headers });
    const data = await handleResponse(response, `/users/${username}`);
    
    return data;
  } catch (error) {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new GitHubAPIError(
        'Network connection failed. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }
    
    // Re-throw our custom errors
    if (error instanceof GitHubAPIError) {
      throw error;
    }
    
    // Unknown errors
    throw new GitHubAPIError(
      'Failed to load user details. Please try again.',
      'API_ERROR'
    );
  }
};

export const getUserStars = async (username) => {
  if (!username?.trim()) {
    throw new GitHubAPIError(
      'Username is required to fetch user stars.',
      'VALIDATION_ERROR'
    );
  }

  try {
    const headers = GITHUB_API_KEY ? { Authorization: `token ${GITHUB_API_KEY}` } : {};
    let totalStars = 0;
    let page = 1;
    const perPage = 100; // GitHub API max per page

    // Fetch all repositories to calculate total stars
    while (true) {
      const url = `${API_BASE_URL}/users/${username.trim()}/repos?page=${page}&per_page=${perPage}&type=owner`;
      const response = await fetch(url, { headers });
      const repos = await handleResponse(response, `/users/${username}/repos`);
      
      if (repos.length === 0) break;
      
      // Sum up stargazers_count for all repos
      totalStars += repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      
      // If we got less than perPage results, we've reached the end
      if (repos.length < perPage) break;
      
      page++;
    }
    
    return totalStars;
  } catch (error) {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new GitHubAPIError(
        'Network connection failed. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }
    
    // Re-throw our custom errors
    if (error instanceof GitHubAPIError) {
      throw error;
    }
    
    // Unknown errors
    throw new GitHubAPIError(
      'Failed to load user stars. Please try again.',
      'API_ERROR'
    );
  }
};
