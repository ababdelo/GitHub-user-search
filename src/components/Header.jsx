
import React, { useEffect, useState } from "react";
import { Sun, Moon, Github } from "lucide-react";

function Header() {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <header className="header">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Github size={28} style={{ verticalAlign: 'middle' }} />
        Github User Search
      </h1>
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
        {darkMode ? <span>Light </span> : <span>Dark </span>}
        {darkMode ? <Sun size={22} /> : <Moon size={22} />}
      </button>
    </header>
  );
}

export default Header;
