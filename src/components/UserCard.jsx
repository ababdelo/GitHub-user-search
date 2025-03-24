
import React from "react";
import { MapPin, Link, Twitter, Building2, ArrowLeft } from "lucide-react";

function UserCard({ user, onBackToResults }) {
  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
  return (
    <div className="user-card">
      {/* Back button at the top of the card */}
      {onBackToResults && (
        <button 
          onClick={onBackToResults}
          className="back-to-results-btn-card"
        >
          <ArrowLeft size={16} />
          Back to Search Results
        </button>
      )}
      
      <div className="user-card-main-row">
        <div className="user-card-left">
          <img src={user.avatar_url} alt="Avatar" className="avatar" />
          <p className="user-login">@{user.login}</p>
          <span className="user-joined">Joined {joinedDate}</span>
        </div>
        <div className="info">
          <div className="header">
            <h2>{user.name || user.login}</h2>
          </div>
          <p className="bio">{user.bio || "No bio available."}</p>
        </div>
      </div>
      <div className="stats">
        <div><strong className="stat-value">{user.public_repos}</strong> Repos</div>
        <div><strong className="stat-value">{user.followers}</strong> Followers</div>
        <div><strong className="stat-value">{user.following}</strong> Following</div>
        {user.totalStars !== undefined && (
          <div><strong className="stat-value">{user.totalStars}</strong> Stars</div>
        )}
      </div>
      <div className="links-grid">
        <div>
          <p><MapPin size={16} style={{verticalAlign:'middle'}} /> {user.location || "Not Available"}</p>
          <p><Link size={16} style={{verticalAlign:'middle'}} /> {user.blog ? <a href={user.blog} target="_blank" rel="noopener noreferrer">{user.blog}</a> : "Not Available"}</p>
        </div>
        <div>
          <p><Twitter size={16} style={{verticalAlign:'middle'}} /> {user.twitter_username ? <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer">@{user.twitter_username}</a> : "Not Available"}</p>
          <p><Building2 size={16} style={{verticalAlign:'middle'}} /> {user.company || "Not Available"}</p>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
