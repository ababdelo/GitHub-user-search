import React from "react";
import { AlertCircle, Search, Wifi, Server, Clock } from "lucide-react";

function ErrorMessage({ error, onRetry }) {
  const getErrorInfo = (error) => {
    // Default error
    let icon = AlertCircle;
    let title = "Something went wrong";
    let message = error?.message || "An unexpected error occurred";
    let actionText = "Try Again";
    let showRetry = true;

    // Check specific error types
    if (error?.type === "NO_RESULTS") {
      icon = Search;
      title = "No users found";
      message = "We couldn't find any users matching your search criteria. Try adjusting your filters or search terms.";
      actionText = "Search Again";
    } else if (error?.type === "NETWORK_ERROR") {
      icon = Wifi;
      title = "Connection problem";
      message = "Please check your internet connection and try again.";
      actionText = "Retry";
    } else if (error?.type === "API_ERROR") {
      icon = Server;
      title = "Server error";
      message = error?.status === 403 
        ? "API rate limit exceeded. Please wait a moment before searching again."
        : "GitHub API is currently unavailable. Please try again later.";
      actionText = "Retry";
    } else if (error?.type === "VALIDATION_ERROR") {
      icon = AlertCircle;
      title = "Invalid search";
      message = "Please enter at least one search criteria (username, location, or minimum repositories).";
      showRetry = false;
    } else if (error?.type === "USER_NOT_FOUND") {
      icon = Search;
      title = "User not found";
      message = "The requested user profile could not be found. They may have been deleted or made private.";
      actionText = "Go Back";
    } else if (error?.type === "RATE_LIMIT") {
      icon = Clock;
      title = "Rate limit exceeded";
      message = "Too many requests. Please wait a few minutes before searching again.";
      actionText = "Retry Later";
    }

    return { icon: icon, title, message, actionText, showRetry };
  };

  const { icon: Icon, title, message, actionText, showRetry } = getErrorInfo(error);

  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">
          <Icon size={48} />
        </div>
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>
        {showRetry && onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
