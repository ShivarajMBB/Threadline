import React, { useState } from 'react';
import { 
  MessageSquare, Users, ExternalLink, Calendar, 
  Check, ArrowRight, Star, Instagram, Zap,
  TrendingUp, Shield, Clock, DollarSign, Menu, X
} from 'lucide-react';

export default function ThreadlineLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <MessageSquare size={28} />
            <span>Threadline CRM</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="nav-menu desktop-menu">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          
          <div className="nav-actions desktop-menu">
            <button className="btn-secondary">Sign In</button>
            <button className="btn-primary">Start Free Trial</button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <button className="btn-secondary mobile-btn">Sign In</button>
            <button className="btn-primary mobile-btn">Start Free Trial</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Instagram size={16} />
              <span>Instagram Business Tool</span>
            </div>
            <h1>Turn Instagram Conversations Into Revenue</h1>
            <p className="hero-subtitle">
              Centralize your Instagram DMs, comments, and story replies in one powerful inbox. 
              Track leads, close deals, and grow your business—all while staying compliant.
            </p>
            <div className="hero-cta">
              <button className="btn-primary btn-large">
                Start Free Trial
                <ArrowRight size={20} />
              </button>
              <button className="btn-outline btn-large">
                Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Businesses</div>
              </div>
              <div className="stat">
                <div className="stat-number">500K+</div>
                <div className="stat-label">Messages/month</div>
              </div>
              <div className="stat">
                <div className="stat-number">$2M+</div>
                <div className="stat-label">Revenue tracked</div>
              </div>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="preview-title">Threadline CRM</div>
              </div>
              <div className="preview-content">
                <div className="preview-sidebar">
                  <div className="preview-nav-item active">
                    <MessageSquare size={16} />
                    <span>Inbox</span>
                  </div>
                  <div className="preview-nav-item">
                    <Users size={16} />
                    <span>Leads</span>
                  </div>
                  <div className="preview-nav-item">
                    <ExternalLink size={16} />
                    <span>Sales</span>
                  </div>
                  <div className="preview-nav-item">
                    <Calendar size={16} />
                    <span>Scheduler</span>
                  </div>
                </div>
                <div className="preview-main">
                  <div className="preview-message">
                    <div className="msg-avatar"></div>
                    <div className="msg-content">
                      <div className="msg-bar"></div>
                      <div className="msg-bar short"></div>
                    </div>
                  </div>
                  <div className="preview-message">
                    <div className="msg-avatar"></div>
                    <div className="msg-content">
                      <div className="msg-bar"></div>
                      <div className="msg-bar short"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header center">
            <h2>Everything You Need to Manage Instagram</h2>
            <p>Four powerful tools in one platform</p>
          </div>

          <div className="features-grid">
            {/* Feature 1: Inbox */}
            <div className="feature-card">
              <div className="feature-icon inbox">
                <MessageSquare size={28} />
              </div>
              <h3>Unified Inbox</h3>
              <p>
                All Instagram messages in one place—DMs, comments, and story replies. 
                Reply manually to every customer with full context and conversation history.
              </p>
              <ul className="feature-list">
                <li><Check size={18} /> Centralized message view</li>
                <li><Check size={18} /> Source tracking (DM/comment/story)</li>
                <li><Check size={18} /> Manual reply interface</li>
                <li><Check size={18} /> Optional acknowledgment message</li>
              </ul>
            </div>

            {/* Feature 2: Leads */}
            <div className="feature-card">
              <div className="feature-icon leads">
                <Users size={28} />
              </div>
              <h3>Lead Management</h3>
              <p>
                Track every Instagram conversation through your sales process. 
                Update lead stages manually and never lose track of a potential customer.
              </p>
              <ul className="feature-list">
                <li><Check size={18} /> Automatic lead creation</li>
                <li><Check size={18} /> Custom funnel stages</li>
                <li><Check size={18} /> Notes & contact info</li>
                <li><Check size={18} /> Source attribution</li>
              </ul>
            </div>

            {/* Feature 3: Sales Pages */}
            <div className="feature-card">
              <div className="feature-icon sales">
                <ExternalLink size={28} />
              </div>
              <h3>Sales Pages</h3>
              <p>
                Create beautiful checkout pages and share them manually with interested customers. 
                Accept payments via Stripe and track conversions.
              </p>
              <ul className="feature-list">
                <li><Check size={18} /> Simple page builder</li>
                <li><Check size={18} /> Stripe integration</li>
                <li><Check size={18} /> Performance analytics</li>
                <li><Check size={18} /> Revenue tracking</li>
              </ul>
            </div>

            {/* Feature 4: Scheduler */}
            <div className="feature-card">
              <div className="feature-icon scheduler">
                <Calendar size={28} />
              </div>
              <h3>Post Scheduler</h3>
              <p>
                Schedule Instagram posts using the official API. Track which content drives 
                conversations with internal keywords—all replies are still manual.
              </p>
              <ul className="feature-list">
                <li><Check size={18} /> Schedule posts ahead</li>
                <li><Check size={18} /> Internal tracking keywords</li>
                <li><Check size={18} /> Link to sales pages</li>
                <li><Check size={18} /> Content performance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header center">
            <h2>How Threadline Works</h2>
            <p>From Instagram message to closed deal in 4 simple steps</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Customer Reaches Out</h3>
                <p>Someone DMs you, comments on your post, or replies to your story on Instagram.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>See It in Your Inbox</h3>
                <p>The message appears in Threadline's unified inbox. A lead is automatically created.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Reply & Track</h3>
                <p>Respond manually to the customer. Update lead stages as the conversation progresses.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Close the Deal</h3>
                <p>Share your sales page link when ready. Customer pays via Stripe. Revenue tracked automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-icon">
                <Clock size={24} />
              </div>
              <h4>Save Hours Daily</h4>
              <p>No more switching between Instagram, notes, and spreadsheets. Everything in one place.</p>
            </div>

            <div className="benefit">
              <div className="benefit-icon">
                <TrendingUp size={24} />
              </div>
              <h4>Convert More Leads</h4>
              <p>Never lose a conversation in your DMs. Track every opportunity from first message to sale.</p>
            </div>

            <div className="benefit">
              <div className="benefit-icon">
                <DollarSign size={24} />
              </div>
              <h4>Track Revenue</h4>
              <p>See exactly which Instagram posts and messages drive sales. Make data-driven decisions.</p>
            </div>

            <div className="benefit">
              <div className="benefit-icon">
                <Shield size={24} />
              </div>
              <h4>100% Compliant</h4>
              <p>Built to Meta's standards. All replies manual. No automation. No risk to your Instagram account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header center">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your business</p>
          </div>

          <div className="pricing-grid">
            {/* Starter */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Starter</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">29</span>
                  <span className="period">/month</span>
                </div>
                <p>Perfect for solo entrepreneurs</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={18} /> 1,000 messages/month</li>
                <li><Check size={18} /> Unified inbox</li>
                <li><Check size={18} /> Lead tracking</li>
                <li><Check size={18} /> 3 sales pages</li>
                <li><Check size={18} /> Post scheduler</li>
                <li><Check size={18} /> Email support</li>
              </ul>
              <button className="btn-outline btn-full">Start Free Trial</button>
            </div>

            {/* Pro */}
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Pro</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">79</span>
                  <span className="period">/month</span>
                </div>
                <p>For growing businesses</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={18} /> 10,000 messages/month</li>
                <li><Check size={18} /> Everything in Starter</li>
                <li><Check size={18} /> Unlimited sales pages</li>
                <li><Check size={18} /> Advanced analytics</li>
                <li><Check size={18} /> Team collaboration</li>
                <li><Check size={18} /> Priority support</li>
              </ul>
              <button className="btn-primary btn-full">Start Free Trial</button>
            </div>

            {/* Business */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Business</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">199</span>
                  <span className="period">/month</span>
                </div>
                <p>For established brands</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={18} /> Unlimited messages</li>
                <li><Check size={18} /> Everything in Pro</li>
                <li><Check size={18} /> Multiple Instagram accounts</li>
                <li><Check size={18} /> Custom integrations</li>
                <li><Check size={18} /> Dedicated account manager</li>
                <li><Check size={18} /> White-label options</li>
              </ul>
              <button className="btn-outline btn-full">Contact Sales</button>
            </div>
          </div>

          <div className="pricing-note">
            All plans include 14-day free trial. No credit card required.
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header center">
            <h2>Loved by Instagram Businesses</h2>
            <p>See what our customers have to say</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <p className="testimonial-text">
                "Threadline helped me go from losing DMs in my Instagram inbox to closing $15K in sales last month. 
                The lead tracking is a game-changer."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">SM</div>
                <div>
                  <div className="author-name">Sarah Martinez</div>
                  <div className="author-title">Wellness Coach</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <p className="testimonial-text">
                "Finally, a tool that doesn't get my Instagram account banned. Everything is manual and compliant, 
                but 10x more organized than before."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">JC</div>
                <div>
                  <div className="author-name">James Chen</div>
                  <div className="author-title">Fitness Brand Owner</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <p className="testimonial-text">
                "The sales pages feature is brilliant. I send custom checkout links to interested customers 
                and track everything. So much easier than DM-ing payment links."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">RP</div>
                <div>
                  <div className="author-name">Rachel Park</div>
                  <div className="author-title">Online Course Creator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header center">
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h4>Is Threadline compliant with Instagram's policies?</h4>
              <p>
                Yes! All replies are sent manually by you. We don't auto-DM, we don't scrape data, 
                and we don't violate any Meta policies. Our app was built specifically to pass Meta's 
                App Review process.
              </p>
            </div>

            <div className="faq-item">
              <h4>Do I need technical skills to use Threadline?</h4>
              <p>
                Not at all. If you can use Instagram, you can use Threadline. The interface is intuitive 
                and designed for business owners, not developers.
              </p>
            </div>

            <div className="faq-item">
              <h4>Can I use this for multiple Instagram accounts?</h4>
              <p>
                Yes, on the Business plan. You can manage multiple Instagram business accounts from one 
                Threadline dashboard.
              </p>
            </div>

            <div className="faq-item">
              <h4>How does the sales page feature work?</h4>
              <p>
                You create simple checkout pages (like Stan or Linktree) inside Threadline. When a customer 
                is interested, you manually send them the link. They pay via Stripe, and the sale is tracked in your CRM.
              </p>
            </div>

            <div className="faq-item">
              <h4>What's the difference between this and automation tools?</h4>
              <p>
                Automation tools send triggered messages and can get your account banned. Threadline is a 
                manual CRM—you write every reply yourself. We just organize everything in one place and help you track leads.
              </p>
            </div>

            <div className="faq-item">
              <h4>Can I try it before paying?</h4>
              <p>
                Absolutely! We offer a 14-day free trial on all plans. No credit card required to start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Turn DMs Into Revenue?</h2>
            <p>Join thousands of businesses using Threadline to manage Instagram conversations and close more deals.</p>
            <div className="cta-buttons">
              <button className="btn-primary btn-large">
                Start Free Trial
                <ArrowRight size={20} />
              </button>
              <button className="btn-outline btn-large white">
                Schedule Demo
              </button>
            </div>
            <div className="cta-note">
              14-day free trial • No credit card required • Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <MessageSquare size={24} />
                <span>Threadline CRM</span>
              </div>
              <p>Turn Instagram conversations into revenue.</p>
              <div className="social-links">
                <a href="#"><Instagram size={20} /></a>
                <a href="#">𝕏</a>
              </div>
            </div>

            <div className="footer-col">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#">Integrations</a>
              <a href="#">Changelog</a>
            </div>

            <div className="footer-col">
              <h5>Company</h5>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>

            <div className="footer-col">
              <h5>Legal</h5>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
              <a href="#">GDPR</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Threadline CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1a1a2e;
          overflow-x: hidden;
        }

        /* Navigation */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e0e0e0;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          color: #667eea;
        }

        .nav-menu {
          display: flex;
          gap: 32px;
        }

        .nav-menu a {
          text-decoration: none;
          color: #6c757d;
          font-weight: 500;
          font-size: 15px;
          transition: color 0.2s;
        }

        .nav-menu a:hover {
          color: #667eea;
        }

        .nav-actions {
          display: flex;
          gap: 12px;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #1a1a2e;
        }

        .mobile-menu {
          display: none;
        }

        /* Buttons */
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #667eea;
          color: white;
        }

        .btn-outline {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #667eea;
          color: white;
        }

        .btn-outline.white {
          color: white;
          border-color: white;
        }

        .btn-outline.white:hover {
          background: white;
          color: #667eea;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 16px;
        }

        .btn-full {
          width: 100%;
          justify-content: center;
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero */
        .hero {
          padding: 120px 0 80px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .hero-content {
          max-width: 600px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .hero h1 {
          font-size: 56px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 20px;
          color: #6c757d;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }

        .hero-stats {
          display: flex;
          gap: 48px;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
        }

        .stat-label {
          font-size: 13px;
          color: #6c757d;
          margin-top: 4px;
        }

        .hero-image {
          position: absolute;
          right: 0;
          top: 140px;
          width: 500px;
        }

        .dashboard-preview {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .preview-header {
          background: #f8f9fa;
          padding: 12px 16px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .preview-dots {
          display: flex;
          gap: 6px;
        }

        .preview-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #dee2e6;
        }

        .preview-title {
          font-size: 13px;
          font-weight: 600;
          color: #6c757d;
        }

        .preview-content {
          display: flex;
          height: 300px;
        }

        .preview-sidebar {
          width: 140px;
          background: #1a1a2e;
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preview-nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 500;
        }

        .preview-nav-item.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .preview-main {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preview-message {
          display: flex;
          gap: 12px;
        }

        .msg-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          flex-shrink: 0;
        }

        .msg-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .msg-bar {
          height: 12px;
          background: #f0f0f0;
          border-radius: 6px;
        }

        .msg-bar.short {
          width: 60%;
        }

        /* Section Headers */
        .section-header {
          margin-bottom: 64px;
        }

        .section-header.center {
          text-align: center;
        }

        .section-header h2 {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .section-header p {
          font-size: 18px;
          color: #6c757d;
        }

        /* Features */
        .features {
          padding: 100px 0;
          background: white;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        .feature-card {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: white;
        }

        .feature-icon.inbox {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .feature-icon.leads {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .feature-icon.sales {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .feature-icon.scheduler {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        .feature-card h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .feature-card > p {
          color: #6c757d;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .feature-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1a1a2e;
          font-size: 15px;
        }

        .feature-list svg {
          color: #667eea;
          flex-shrink: 0;
        }

        /* How It Works */
        .how-it-works {
          padding: 100px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .how-it-works .section-header h2,
        .how-it-works .section-header p {
          color: white;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .step {
          text-align: center;
        }

        .step-number {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          margin: 0 auto 20px;
        }

        .step-content h3 {
          font-size: 20px;
          margin-bottom: 12px;
        }

        .step-content p {
          font-size: 15px;
          opacity: 0.9;
          line-height: 1.6;
        }

        /* Benefits */
        .benefits {
          padding: 100px 0;
          background: white;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .benefit {
          text-align: center;
        }

        .benefit-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .benefit h4 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .benefit p {
          color: #6c757d;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Pricing */
        .pricing {
          padding: 100px 0;
          background: #f8f9fa;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 32px;
        }

        .pricing-card {
          background: white;
          border-radius: 16px;
          padding: 40px 32px;
          border: 2px solid #e0e0e0;
          position: relative;
          transition: all 0.3s;
        }

        .pricing-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .pricing-card.popular {
          border-color: #667eea;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .pricing-header h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .price {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          margin-bottom: 12px;
        }

        .currency {
          font-size: 24px;
          font-weight: 700;
          margin-top: 8px;
        }

        .amount {
          font-size: 56px;
          font-weight: 800;
          line-height: 1;
        }

        .period {
          font-size: 16px;
          color: #6c757d;
          margin-top: 12px;
        }

        .pricing-header p {
          color: #6c757d;
          font-size: 15px;
        }

        .pricing-features {
          list-style: none;
          margin-bottom: 32px;
        }

        .pricing-features li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          font-size: 15px;
        }

        .pricing-features svg {
          color: #667eea;
          flex-shrink: 0;
        }

        .pricing-note {
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }

        /* Testimonials */
        .testimonials {
          padding: 100px 0;
          background: white;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .testimonial-card {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 32px;
        }

        .stars {
          display: flex;
          gap: 4px;
          color: #fbbf24;
          margin-bottom: 20px;
        }

        .testimonial-text {
          color: #1a1a2e;
          line-height: 1.6;
          margin-bottom: 24px;
          font-size: 15px;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .author-name {
          font-weight: 700;
          font-size: 15px;
        }

        .author-title {
          font-size: 13px;
          color: #6c757d;
        }

        /* FAQ */
        .faq {
          padding: 100px 0;
          background: #f8f9fa;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        .faq-item {
          background: white;
          border-radius: 12px;
          padding: 28px;
        }

        .faq-item h4 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .faq-item p {
          color: #6c757d;
          line-height: 1.6;
          font-size: 15px;
        }

        /* Final CTA */
        .final-cta {
          padding: 100px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .cta-content p {
          font-size: 20px;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .cta-note {
          font-size: 14px;
          opacity: 0.8;
        }

        /* Footer */
        .footer {
          background: #1a1a2e;
          color: white;
          padding: 60px 0 32px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .footer-col p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .social-links {
          display: flex;
          gap: 12px;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.2s;
        }

        .social-links a:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .footer-col h5 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 16px;
          letter-spacing: 1px;
        }

        .footer-col a {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          margin-bottom: 12px;
          font-size: 14px;
          transition: color 0.2s;
        }

        .footer-col a:hover {
          color: white;
        }

        .footer-bottom {
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .footer-bottom p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 20px 24px;
            background: white;
            border-top: 1px solid #e0e0e0;
          }

          .mobile-menu a {
            color: #6c757d;
            text-decoration: none;
            font-weight: 500;
            font-size: 15px;
          }

          .mobile-btn {
            width: 100%;
          }

          .hero {
            padding: 100px 0 60px;
          }

          .hero h1 {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .hero-image {
            position: relative;
            width: 100%;
            top: 0;
            margin-top: 40px;
          }

          .hero-cta {
            flex-direction: column;
          }

          .hero-stats {
            gap: 24px;
          }

          .features-grid,
          .pricing-grid,
          .testimonials-grid,
          .faq-grid {
            grid-template-columns: 1fr;
          }

          .steps,
          .benefits-grid {
            grid-template-columns: 1fr 1fr;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .section-header h2 {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}
