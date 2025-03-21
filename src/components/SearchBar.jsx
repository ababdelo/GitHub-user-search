import React, { useState, useImperativeHandle, forwardRef } from "react";
import { searchUsersAdvanced, getUserDetails, getUserStars } from "../services/githubService";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import "../assets/css/SearchBar.css";
import { Search, Plus, Minus } from "lucide-react";

const SearchBar = forwardRef(({ setUserData }, ref) => {
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [minRepos, setMinRepos] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [savedResults, setSavedResults] = useState([]);
  const [savedTotalCount, setSavedTotalCount] = useState(0);
  const [savedPage, setSavedPage] = useState(1);
  const perPage = 10;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError(null);
    setResults([]);
    setTotalCount(0);
    setUserData && setUserData(null);
    
    try {
      const data = await searchUsersAdvanced({ 
        username: username.trim(), 
        location: location.trim(), 
        minRepos: minRepos.trim(), 
        page: 1, 
        perPage 
      });
      
      // Add artificial delay for better UX
      await new Promise(res => setTimeout(res, 900));
      
      setResults(data.items || []);
      setTotalCount(data.total_count || 0);
      setPage(1);
    } catch (err) {
      console.error('Search error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchUsersAdvanced({ 
        username: username.trim(), 
        location: location.trim(), 
        minRepos: minRepos.trim(), 
        page: newPage, 
        perPage 
      });
      
      setResults(data.items || []);
      setTotalCount(data.total_count || 0);
      setPage(newPage);
    } catch (err) {
      console.error('Pagination error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    setUserLoading(true);
    setUserError(null);
    
    try {
      // Save current search results before hiding them
      setSavedResults([...results]);
      setSavedTotalCount(totalCount);
      setSavedPage(page);
      
      // Fetch detailed user information and stars count from GitHub API
      const [detailedUser, totalStars] = await Promise.all([
        getUserDetails(user.login),
        getUserStars(user.login)
      ]);
      
      // Add stars count to user object
      detailedUser.totalStars = totalStars;
      
      setUserData(detailedUser);
      
      // Hide search results when showing user details
      setResults([]);
      setTotalCount(0);
    } catch (err) {
      console.error('User fetch error:', err);
      setUserError(err);
      
      // Restore search results on error
      setResults(savedResults);
      setTotalCount(savedTotalCount);
      setPage(savedPage);
    } finally {
      setUserLoading(false);
    }
  };

  const handleBackToResults = () => {
    // Restore saved search results
    setResults(savedResults);
    setTotalCount(savedTotalCount);
    setPage(savedPage);
    setUserData(null);
    setUserError(null);
  };

  const handleRetry = () => {
    if (error?.type === 'NO_RESULTS' || error?.type === 'VALIDATION_ERROR') {
      // Clear error to show search form again
      setError(null);
    } else {
      // Retry the last search
      handleSearch();
    }
  };

  const handleUserErrorRetry = () => {
    setUserError(null);
  };

  // Expose the handleBackToResults function to parent component
  useImperativeHandle(ref, () => ({
    handleBackToResults
  }));

  return (
    <>
      <div className="searchbar-center">
        <form className="searchbar-advanced-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            aria-label="Username"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            aria-label="Location"
          />
          <div className="custom-number-input">
            <button
              type="button"
              className="number-btn"
              onClick={() => setMinRepos(prev => Math.max(0, Number(prev || 0) - 1))}
              aria-label="Decrease"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min="0"
              placeholder="Min repos"
              value={minRepos}
              onChange={e => setMinRepos(e.target.value)}
              aria-label="Minimum Repositories"
            />
            <button
              type="button"
              className="number-btn"
              onClick={() => setMinRepos(prev => Number(prev || 0) + 1)}
              aria-label="Increase"
            >
              <Plus size={16} />
            </button>
          </div>
          <button type="submit" title="Search" aria-label="Search" disabled={loading}>
            <Search size={20} />
          </button>
        </form>
      </div>

      {loading && <Loader />}
      
      {userLoading && (
        <div className="loading-message">
          <p>Loading user details and calculating stars...</p>
        </div>
      )}

      {error && (
        <ErrorMessage 
          error={error} 
          onRetry={handleRetry}
        />
      )}

      {userError && (
        <ErrorMessage 
          error={userError} 
          onRetry={handleUserErrorRetry}
        />
      )}

      {results.length > 0 && !loading && !error && (
        <div className="search-results">
          <div className="results-header">
            <h3>Found {totalCount.toLocaleString()} users</h3>
          </div>
          <ul className="search-results-list">
            {results.map(user => (
              <li key={user.id} className="search-result-item">
                <img src={user.avatar_url} alt={user.login} className="search-result-avatar" />
                <div className="search-result-info">
                  <button 
                    onClick={() => handleUserClick(user)}
                    className="search-result-username-btn"
                    disabled={userLoading}
                  >
                    {user.login}
                  </button>
                  <div className="search-result-id">ID: {user.id}</div>
                  <a 
                    href={user.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="search-result-github-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on GitHub
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <div className="search-pagination">
            <button 
              onClick={() => handlePageChange(page - 1)} 
              disabled={page === 1 || loading} 
              className="search-pagination-btn"
            >
              Prev
            </button>
            <span className="search-pagination-info">
              Page {page} of {Math.ceil(totalCount / perPage)}
            </span>
            <button 
              onClick={() => handlePageChange(page + 1)} 
              disabled={page * perPage >= totalCount || loading} 
              className="search-pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default SearchBar;
