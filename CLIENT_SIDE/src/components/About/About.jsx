import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import styles from "./About.module.css";

export default function About() {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://facebook.com",
      icon: <FaFacebookF />,
      color: "#3b5998",
      hoverColor: "#2d4373"
    },
    {
      name: "Twitter",
      url: "https://twitter.com",
      icon: <FaTwitter />,
      color: "#1da1f2",
      hoverColor: "#0d95e8"
    },
    {
      name: "Instagram",
      url: "https://instagram.com",
      icon: <FaInstagram />,
      color: "#e4405f",
      hoverColor: "#cc3750"
    }
  ];

  return (
    <section className={styles.aboutSection} aria-labelledby="about-heading">
      <div className={styles.aboutContent}>
        <h2 id="about-heading">About BY FAITH & HOPE Academy</h2>

        <div className={styles.aboutText}>
          <p className={styles.highlight}>
            At BY FAITH & HOPE Academy, we are committed to providing quality education 
            based on CBE curriculum that nurtures holistic growth.
          </p>
          <p>
            Our mission is to inspire young minds through creativity, critical thinking, 
            and community engagement. We believe in fostering an environment where students 
            can thrive academically, socially, and emotionally.
          </p>
          <p>
            We offer a diverse curriculum that blends academic excellence with co-curricular 
            activities, ensuring students are well-rounded and prepared for the future.
          </p>
        </div>

        <div className={styles.connectSection}>
          <h3>Connect With Us</h3>
          <p className={styles.connectSubtitle}>Follow us on social media for updates</p>

          <div className={styles.socialLinks}>
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                style={{
                  "--bg-color": link.color,
                  "--hover-color": link.hoverColor
                }}
                aria-label={`Follow us on ${link.name}`}
              >
                <span className={styles.socialIcon}>{link.icon}</span>
                <span className={styles.socialText}>{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

