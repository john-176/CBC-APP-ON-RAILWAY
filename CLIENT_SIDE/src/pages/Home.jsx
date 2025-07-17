import { Link } from "react-router-dom";
import Hero from "../components/hero/Hero";
import Showcase from "../components/showcase/Showcase";
import VideoShowcase from "../components/videos/VideoShowcase";

export default function Home() {
  return (
    <div  className="home-div">
      <div>< Hero/></div>
      <div><Showcase/></div>
      <div>< VideoShowcase/></div>
    </div>
  );
}
