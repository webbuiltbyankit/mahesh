import React, { useState } from 'react';
import {
  CheckCircle2,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import type { DemoContactForm } from '../types/catalog';
import { getBrandMetadata } from '../data/catalogRepository';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  buildGeneralWhatsAppUrl,
  buildWhatsAppUrlFromText,
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  WHATSAPP_DISPLAY_NUMBER,
} from '../utils/whatsapp';

const INITIAL_CONTACT: DemoContactForm = {
  name: '',
  contact: '',
  subject: 'Product Availability & Ordering',
  productCode: '',
  message: '',
};

export const ContactPage: React.FC = () => {
  const brand = getBrandMetadata();
  const [form, setForm] = useState<DemoContactForm>(INITIAL_CONTACT);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setError('Please enter your name and enquiry message.');
      return;
    }
    setError(null);
    setIsSubmitted(true);
  };

  const buildWhatsAppFromEnquiry = (): string => {
    const lines = [
      `Hello Mahesh Designers,`,
      `Name: ${form.name.trim()}`,
      form.contact.trim() ? `Contact: ${form.contact.trim()}` : null,
      `Topic: ${form.subject}`,
      form.productCode.trim() ? `Product Code / ID: ${form.productCode.trim()}` : null,
      ``,
      form.message.trim(),
    ].filter(Boolean);
    return buildWhatsAppUrlFromText(lines.join('\n'));
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact & Boutique Assistance' },
        ]}
      />

      <header
        style={{
          paddingBlock: '1.5rem 2.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2.5rem',
        }}
      >
        <span className="eyebrow">Reach Mahesh Designers</span>
        <h1 className="serif-h1" style={{ marginTop: '0.35rem', marginBottom: '0.65rem' }}>
          Contact &amp; Personal Shopping Assistance
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '60ch' }}>
          Connect directly with our boutique team in {brand.cityState} via WhatsApp or Instagram to
          enquire about saree drapes, unstitched dress material sets, or fabric meterage.
        </p>
      </header>

      <div className="checkout-grid">
        {/* Left: Direct Channels — Prompts 228–232 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="pdp-info-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <MessageCircle size={20} color="var(--brand-plum)" aria-hidden="true" />
              <h2 className="serif-h3">Primary WhatsApp Concierge</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Our fastest channel for piece availability, product code lookups (e.g.{' '}
              <span className="sku-code">SKU052MAUVAPUR</span>), and order confirmation.
            </p>
            <a
              href={buildGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Phone size={15} aria-hidden="true" />
              <span>Chat on WhatsApp: {WHATSAPP_DISPLAY_NUMBER}</span>
            </a>
          </div>

          <div className="pdp-info-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Instagram size={20} color="var(--brand-plum)" aria-hidden="true" />
              <h2 className="serif-h3">Official Instagram Showcase</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Follow <strong>{INSTAGRAM_HANDLE}</strong> (and our related boutique handle{' '}
              <strong>{brand.relatedBoutiqueHandle}</strong>) for new saree and dress material
              arrivals.
            </p>
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Instagram size={15} aria-hidden="true" />
              <span>Visit {INSTAGRAM_HANDLE}</span>
            </a>
          </div>

          <div className="pdp-info-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <MapPin size={20} color="var(--brand-plum)" aria-hidden="true" />
              <h2 className="serif-h3">Boutique Location</h2>
            </div>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              Mahesh Designers — {brand.cityState}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Please message us on WhatsApp ({WHATSAPP_DISPLAY_NUMBER}) for current visiting hours,
              exact street directions, and PIN code confirmation in Tirupur.
            </p>
          </div>
        </div>

        {/* Right: Client-Side Enquiry Composer — Prompt 231 */}
        <section
          className="pdp-info-card"
          aria-labelledby="enquiry-form-heading"
          style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)' }}
        >
          <span className="eyebrow">Demo Enquiry Composer</span>
          <h2 id="enquiry-form-heading" className="serif-h2" style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            Prepare a Boutique Message
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Concept preview form — composes your enquiry in browser memory and lets you open it
            directly in WhatsApp.
          </p>

          {isSubmitted ? (
            <div
              style={{
                padding: '1.5rem',
                background: 'var(--bg-plum-tint)',
                border: '1px solid rgba(76,32,90,0.25)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--brand-plum)', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>Enquiry Preview Ready</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-ink)', marginBottom: '1rem' }}>
                Because this demo site does not send background emails, click below to open your
                formatted message directly in WhatsApp with {WHATSAPP_DISPLAY_NUMBER}.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <a
                  href={buildWhatsAppFromEnquiry()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <MessageCircle size={15} aria-hidden="true" />
                  <span>Open in WhatsApp</span>
                </a>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsSubmitted(false)}
                >
                  Edit Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div
                  role="alert"
                  style={{
                    padding: '0.65rem 0.9rem',
                    background: 'var(--status-error-bg)',
                    color: 'var(--status-error)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-info">
                  Phone or Email (Optional)
                </label>
                <input
                  id="contact-info"
                  type="text"
                  className="form-input"
                  placeholder="+91 ... or email"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-subject">
                    Enquiry Topic
                  </label>
                  <select
                    id="contact-subject"
                    className="form-select"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="Product Availability & Ordering">Product Availability</option>
                    <option value="Unstitched Dress Material Query">Dress Material Set Query</option>
                    <option value="Fabric Cut & Meterage Confirmation">Fabric Meterage</option>
                    <option value="Boutique Visit / General Question">General Question</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-sku">
                    Product Code (Optional)
                  </label>
                  <input
                    id="contact-sku"
                    type="text"
                    className="form-input"
                    placeholder="e.g. SKU052MAUVAPUR"
                    value={form.productCode}
                    onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">
                  Your Message *
                </label>
                <textarea
                  id="contact-message"
                  className="form-textarea"
                  placeholder="Let us know which saree, dress material, or fabric you are interested in..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={15} aria-hidden="true" />
                <span>Preview Enquiry &amp; Connect</span>
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

