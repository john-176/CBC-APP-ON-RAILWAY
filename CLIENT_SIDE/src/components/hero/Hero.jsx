import Achievers from "../Achievers/Achievers";
import "./Hero.css";
import heroBg from "../../assets/herobg.jpg";

export default function Hero() {
  return (
    <div className="home">
      <div className="hero-container">
        <div className="hero-left">
          <div className="school-moto">
            <h1>BY FAITH & HOPE ACADEMY</h1>

            <div className="home-section">
              <h2>MOTTO:</h2>
              <p>A safe haven for children in a troubled world.</p>
            </div>

            <div className="home-section">
              <h2>MISSION:</h2>
              <p>To feed, to clothe, to educate and to love these children.</p>
            </div>

            <div className="home-section">
              <h2>OUR VISION:</h2>
              <p>
                Every child deserves a chance to reach their potential,<br />
                we, the founders of the academy, have sworn to give that<br />
                to the underprivileged children — twig by twig like the bird<br />
                until the nest is complete.
              </p>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <img src={heroBg} alt="Hero" />
        </div>
      </div>

      <div><Achievers /></div>
    </div>
  );
}
