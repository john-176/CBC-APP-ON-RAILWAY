import "./Directions.css";
import React from "react";

export default function Directions() {
  return (
    <div className="directions" style={{ padding: "1rem" }}>
      <h1>Visit Us</h1>
      <p>We are located in Elburgon, Nakuru Kenya.</p>
      <div className="map" style={{ marginTop: "1rem" }}>
        <iframe
          title="Elburgon Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9277.944858881112!2d35.80074016617682!3d-0.2844794452208975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182a236afa58ac91%3A0x84308842fefba5f9!2sBy%20Faith%20and%20Hope%20Academy%2C%20Elburgon!5e0!3m2!1sen!2ske!4v1750148503173!5m2!1sen!2ske"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}
