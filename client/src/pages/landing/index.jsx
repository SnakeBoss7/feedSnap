import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Star, MessageSquare, BarChart3, Zap, Shield, Globe, ArrowRight, Check, Copy, Play, Link2Icon, Mail, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import { SimpleSidebar } from "../../components/sidebar/homeSidebar";
import { Footer } from "../../components/footer/footer";
import Hero from "../../components/Landing/hero";
import Navigation from "../../components/ui/navigation";
import CTA from "../../components/Landing/ct";
import HowItWorks from "../../components/Landing/how-it-works";
import FeaturesPreview from "../../components/Landing/feature";
import Showcase from "../../components/Landing/showcase";
import Benefits from "../../components/Landing/benefits";
const Home = () => {
  const [email, setEmail] = useState("");

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