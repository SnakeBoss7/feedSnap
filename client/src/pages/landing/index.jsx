import Header from "../../components/header";
import { Footer } from "../../components/footer/footer";
import Hero from "../../components/PageComponents/Landing/hero";
import CTA from "../../components/PageComponents/Landing/ct";
import HowItWorks from "../../components/PageComponents/Landing/how-it-works";
import FeaturesPreview from "../../components/PageComponents/Landing/feature";
import Showcase from "../../components/PageComponents/Landing/showcase";
import Benefits from "../../components/PageComponents/Landing/benefits";
const Home = () => {

  return (
    <div className="min-h-screen ">
      <Header/>
    <Hero/>
    <FeaturesPreview/>
    <HowItWorks/>
    <Showcase/>
    <Benefits/>
    <CTA/>
       <Footer/>
    </div>
  );
};

export default Home;