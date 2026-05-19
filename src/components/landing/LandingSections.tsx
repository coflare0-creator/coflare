import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  Shield,
  Users,
  Zap,
  Globe,
  Smartphone,
  BarChart3,
  Bell,
  Waves,
  CloudRain,
  Thermometer,
  Wind,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const partners = [
  "/partners/chsd.jpg",
  "/partners/ideamaps.png",
  "/partners/lusg.png",
  "/partners/sdi.png.webp",
  "/partners/urbanbetter.jpg",
];

const features = [
  {
    icon: MapPin,
    title: "GPS Location Tracking",
    description:
      "Auto-detect incident locations with manual correction capability.",
  },
  {
    icon: Smartphone,
    title: "Offline-First Design",
    description: "Report incidents without internet. Auto-sync when connected.",
  },
  {
    icon: Shield,
    title: "Verified Reports",
    description: "Community moderation ensures data accuracy and reliability.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights, trends, and predictive analysis.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Push, SMS, and WhatsApp notifications for nearby incidents.",
  },
  {
    icon: Users,
    title: "Multi-Stakeholder",
    description: "Serves governments, NGOs, researchers, and citizens.",
  },
];

const incidentTypes = [
  { icon: Waves, label: "Flooding", color: "flood" },
  { icon: CloudRain, label: "Heavy Rain", color: "rain" },
  { icon: Thermometer, label: "Heat Waves", color: "heat" },
  { icon: Wind, label: "Pollution", color: "pollution" },
  { icon: Trash2, label: "Waste Dumping", color: "waste" },
  { icon: AlertTriangle, label: "Hazards", color: "hazard" },
];

const stats = [
  { value: "50K+", label: "Reports Submitted" },
  { value: "36", label: "States Covered" },
  { value: "1.2M", label: "Citizens Protected" },
  { value: "99.9%", label: "Uptime" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden">
      {}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
      </div>
      {}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-8">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Live monitoring across Nigeria
            </div>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-6"
          >
            CO-FLARE:
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-6"
          >
            Citizen Observatory for Flood Learning, Action, Resource and Early
            Warning
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            Report floods, pollution, and environmental hazards. Help protect
            your community with real-time data that empowers emergency
            responders and policymakers.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/submit">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl px-8 py-6 text-lg gap-2"
            >
              Report an Incident
              <ArrowRight size={20} />
            </Button>
          </Link>
          <Link to="/map">
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-6 text-lg gap-2"
            >
              <MapPin size={20} />
              View Live Map
            </Button>
          </Link>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-16"
        >
          {incidentTypes.map((type, index) => (
            <motion.div
              key={type.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white"
            >
              <type.icon size={18} />
              <span className="text-sm font-medium">{type.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Africa's Realities
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Designed for low-data usage, offline capability, and multi-channel
            communication to reach every community.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Spot an Issue",
      description:
        "Witness flooding, pollution, or any environmental hazard in your area.",
      icon: AlertTriangle,
      color: "from-orange-400 to-red-500",
    },
    {
      number: "02",
      title: "Report It",
      description:
        "Open the app, select incident type, add photos/videos, and submit.",
      icon: Smartphone,
      color: "from-blue-400 to-cyan-500",
    },
    {
      number: "03",
      title: "Get Verified",
      description:
        "Our moderators verify the report for accuracy and reliability.",
      icon: Shield,
      color: "from-green-400 to-emerald-500",
    },
    {
      number: "04",
      title: "Alert Community",
      description: "Nearby residents receive alerts. Responders take action.",
      icon: Bell,
      color: "from-purple-400 to-indigo-500",
    },
  ];

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-3 block">
            Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            How Co-flare Works
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            From spotting an incident to community action in just four simple
            steps. Built for speed and reliability.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-orange-400 via-emerald-400 to-indigo-500 opacity-20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
              }}
              className="relative group"
            >
              <div className="bg-background border shadow-sm rounded-2xl p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative z-10">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                <div className="absolute top-6 right-6 text-6xl font-black text-muted/30 group-hover:text-muted/50 transition-colors">
                  {step.number}
                </div>

                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Join the Movement
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
            Be part of a community making a difference. Every report helps
            protect lives and build resilience against environmental challenges.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg gap-2"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function PartnersSection() {
  // duplicate for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Partners
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Working together with governments, NGOs, researchers, and
            international organizations to build resilient communities.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-16 w-max"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20,
          }}
        >
          {duplicatedPartners.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-[180px]"
            >
              <img
                src={logo}
                alt="Partner logo"
                className="h-16 w-auto object-contain  opacity-70  transition-all duration-300"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
