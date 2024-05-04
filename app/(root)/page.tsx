import Headerbox from "@/components/Headerbox";
import RightsideBar from "@/components/RightsideBar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";

const Home = () => {
  const loggedIn = {
    firstName: "Aniket",
    lastName: "Khambal",
    email: "aniketocto@gmail.com",
  };
  return (
    <div className="home">
      <div className="home-content">
        <header className="home-header">
          <Headerbox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Access and manage your account and transactions efficiently"
          />

          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={5550.36}
          />
        </header>
        RECENT TRANSACTIONS
      </div>
      <RightsideBar
        user={loggedIn}
        transactions={[]}
        banks={[{ currentBalance: 750 }, { currentBalance: 1000.25 }]}
      />
    </div>
  );
};

export default Home;
