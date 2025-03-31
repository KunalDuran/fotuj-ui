import Head from 'next/head';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState('monthly');

  const features = [
    {
      title: "Client Galleries",
      description: "Create beautiful, password-protected galleries for your clients to view their photos",
      icon: "🎯"
    },
    {
      title: "Photo Selection",
      description: "Let clients easily select their favorite photos with our intuitive selection interface",
      icon: "❤️"
    },
    {
      title: "Smart Organization",
      description: "Organize photos by event, client, or date with our powerful categorization system",
      icon: "📁"
    },
    {
      title: "Client Communication",
      description: "Built-in messaging system to communicate with clients about their selections",
      icon: "💬"
    },
    {
      title: "Watermarking",
      description: "Protect your work with customizable watermarking options",
      icon: "🛡️"
    },
    {
      title: "Analytics Dashboard",
      description: "Track client engagement and photo selection patterns",
      icon: "📊"
    }
  ];

  const pricing = {
    monthly: [
      {
        name: "Basic",
        price: 19.99,
        features: [
          "Up to 5 active galleries",
          "100 photos per gallery",
          "Basic watermarking",
          "Email support",
          "Client selection interface",
          "Basic analytics"
        ]
      },
      {
        name: "Professional",
        price: 49.99,
        features: [
          "Up to 20 active galleries",
          "500 photos per gallery",
          "Advanced watermarking",
          "Priority support",
          "Client messaging system",
          "Advanced analytics",
          "Custom branding",
          "Bulk photo upload"
        ],
        popular: true
      },
      {
        name: "Studio",
        price: 99.99,
        features: [
          "Unlimited galleries",
          "Unlimited photos per gallery",
          "Premium watermarking",
          "24/7 support",
          "Client messaging system",
          "Advanced analytics",
          "Custom branding",
          "Bulk photo upload",
          "API access",
          "Dedicated account manager",
          "Team collaboration"
        ]
      }
    ],
    yearly: [
      {
        name: "Basic",
        price: 179.99,
        features: [
          "Up to 5 active galleries",
          "100 photos per gallery",
          "Basic watermarking",
          "Email support",
          "Client selection interface",
          "Basic analytics"
        ]
      },
      {
        name: "Professional",
        price: 449.99,
        features: [
          "Up to 20 active galleries",
          "500 photos per gallery",
          "Advanced watermarking",
          "Priority support",
          "Client messaging system",
          "Advanced analytics",
          "Custom branding",
          "Bulk photo upload"
        ],
        popular: true
      },
      {
        name: "Studio",
        price: 899.99,
        features: [
          "Unlimited galleries",
          "Unlimited photos per gallery",
          "Premium watermarking",
          "24/7 support",
          "Client messaging system",
          "Advanced analytics",
          "Custom branding",
          "Bulk photo upload",
          "API access",
          "Dedicated account manager",
          "Team collaboration"
        ]
      }
    ]
  };

  const faqs = [
    {
      question: "How does the client selection process work?",
      answer: "Clients receive a secure link to their gallery where they can view photos, mark favorites, and leave comments. You can set selection limits and deadlines, and receive notifications when clients make their choices."
    },
    {
      question: "Can I customize the gallery appearance?",
      answer: "Yes, you can customize colors, layouts, and branding to match your photography style. Professional and Studio plans offer advanced customization options."
    },
    {
      question: "How secure are the client galleries?",
      answer: "Each gallery is password-protected and can be accessed only through a unique secure link. You can also set expiration dates and control access permissions."
    },
    {
      question: "What photo formats are supported?",
      answer: "We support all major photo formats including RAW, JPG, PNG, and TIFF. Maximum file size is 50MB per photo."
    }
  ];

  return (
    <div className={styles.container}>
      <Head>
        <title>Fotuj - Professional Client Gallery & Photo Selection Platform</title>
        <meta name="description" content="Streamline your photography workflow with Fotuj. Create beautiful client galleries, enable easy photo selection, and manage client communications all in one place." />
        <meta name="keywords" content="photography gallery, client gallery, photo selection, photographer tools, client proofing, photo sharing" />
        <meta property="og:title" content="Fotuj - Professional Client Gallery & Photo Selection Platform" />
        <meta property="og:description" content="Streamline your photography workflow with Fotuj. Create beautiful client galleries, enable easy photo selection, and manage client communications all in one place." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Fotuj - Streamline Your Photography Workflow
          </h1>
          <p className={styles.description}>
            Create beautiful client galleries, enable easy photo selection, and manage client communications all in one place. Perfect for professional photographers.
          </p>
          <div className={styles.cta}>
            <button className={styles.primaryButton}>Start Free Trial</button>
            <button className={styles.secondaryButton}>View Pricing</button>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <h2>Everything You Need to Manage Client Galleries</h2>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className={styles.pricing}>
          <h2>Simple, Transparent Pricing</h2>
          <div className={styles.pricingToggle}>
            <button 
              className={`${styles.toggleButton} ${activeTab === 'monthly' ? styles.active : ''}`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`${styles.toggleButton} ${activeTab === 'yearly' ? styles.active : ''}`}
              onClick={() => setActiveTab('yearly')}
            >
              Yearly <span className={styles.savings}>Save 25%</span>
            </button>
          </div>
          <div className={styles.pricingGrid}>
            {pricing[activeTab].map((plan, index) => (
              <div key={index} className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}>
                {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
                <h3>{plan.name}</h3>
                <div className={styles.price}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{plan.price}</span>
                  <span className={styles.period}>/{activeTab === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className={styles.featuresList}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button className={styles.selectPlan}>Select Plan</button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faq}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <h2>Ready to Transform Your Client Experience?</h2>
          <p>Join thousands of photographers who trust Fotuj for their client gallery and photo selection needs.</p>
          <button className={styles.primaryButton}>Start Your Free Trial</button>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Fotuj. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 