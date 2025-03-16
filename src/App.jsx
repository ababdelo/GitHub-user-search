import React, { useState, useRef } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import UserCard from "./components/UserCard";
import Footer from "./components/Footer";
import "./assets/css/styles.css";

function App() {
  const [userData, setUserData] = useState(null);
  const searchBarRef = useRef();

  const handleBackToResults = () => {
    if (searchBarRef.current) {
      searchBarRef.current.handleBackToResults();
    }
  };

  return (
    <div className={`app`}>
      <Header />
      <main className="container">
        <SearchBar ref={searchBarRef} setUserData={setUserData} />
        {userData && (
          <UserCard 
            user={userData} 
            onBackToResults={handleBackToResults}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
