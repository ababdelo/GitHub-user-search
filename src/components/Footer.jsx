import React from "react";
import { Github, Heart, Code } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p className="footer-text">
            Made with React by{" "}
            <a
              href="https://ed42.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              ababdelo
            </a>
          </p>
        </div>
        
        <div className="footer-links">
          <a
            href="https://github.com/ababdelo/github-user-search"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            title="View Source Code"
          >
            <Code size={18} />
            <span>Source Code</span>
          </a>
          
          <a 
            href="https://api.github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
            title="GitHub API"
          >
            <Github size={18} />
            <span>GitHub API</span>
          </a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} GitHub User Search, All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
