import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lock,
  MessageCircle,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import type { DemoCheckoutForm } from '../types/catalog';
import { useShop } from '../context/ShopContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  buildWhatsAppUrlFromText,
  WHATSAPP_DISPLAY_NUMBER,
} from '../utils/whatsapp';

const INITIAL_FORM: DemoCheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  addressLine: '',
  city: '',
  state: 'Tamil Nadu',
  pinCode: '',
  notes: '',
};

export const CheckoutDemoPage: React.FC = () => {
  const {
    hydratedBagLines,
    bagItemCount,
    bagSubtotalFormatted,
    clearBag,
  } = useShop();

  // Held in component memory only — never persisted to localStorage (Prompts 203 & 212)
  const [form, setForm] = useState<DemoCheckoutForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof DemoCheckoutForm, string>>>({});
  const [isPreviewSubmitted, setIsPreviewSubmitted] = useState(false);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof DemoCheckoutForm, string>> = {};
    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Please enter your name for the order preview.';
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      nextErrors.phone = 'Please enter a valid 10-digit mobile or WhatsApp number.';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address or leave blank.';
    }
    if (!form.addressLine.trim()) {
      nextErrors.addressLine = 'Please enter a sample delivery street address.';
    }
    if (!form.city.trim()) {
      nextErrors.city = 'Please enter your city.';
    }
    if (!form.pinCode.trim() || !/^\d{6}$/.test(form.pinCode.trim())) {
      nextErrors.pinCode = 'Please enter a 6-digit Indian PIN code.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsPreviewSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFieldChange = (field: keyof DemoCheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const buildDetailedWhatsAppInquiry = (): string => {
    const itemLines = hydratedBagLines.map(
      (item, idx) =>
        `${idx + 1}. ${item.product.displayTitle}${
          item.product.productCode ? ` [${item.product.productCode}]` : ''
        } — Qty ${item.quantity} × ${item.product.priceFormatted} = ${item.lineTotalFormatted}`
    );

    const text = [
      `Hello Mahesh Designers,`,
      `I prepared an order preview on your catalog demo and would like to confirm availability:`,
      ``,
      `Customer Name: ${form.fullName.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Delivery City / PIN: ${form.city.trim()}, ${form.state.trim()} - ${form.pinCode.trim()}`,
      form.notes.trim() ? `Note: ${form.notes.trim()}` : null,
      ``,
      `Selected Pieces:`,
      ...itemLines,
      ``,
      `Illustrative Merchandise Subtotal: ${bagSubtotalFormatted}`,
      `Please share current availability, shipping charges, and ordering instructions.`,
    ]
      .filter(Boolean)
      .join('\n');

    return buildWhatsAppUrlFromText(text);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shopping Bag', href: '/bag' },
          { label: 'Checkout Preview (Demo)' },
        ]}
      />

      {/* Explicit Concept Preview Disclosure Banner — Prompt 202 */}
      <div className="demo-banner" role="region" aria-label="Demo checkout notice" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--brand-plum)',
            marginBottom: '0.35rem',
          }}
        >
          <ShieldAlert size={17} aria-hidden="true" />
          <span>Concept Preview — No Orders or Payments Processed</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-ink)' }}>
          This checkout flow is a browser-only frontend demonstration. Details entered below remain
          solely in temporary browser memory and are cleared when you leave this page. No payment
          gateway is connected and no live order is created.
        </p>
      </div>

      {hydratedBagLines.length === 0 ? (
        <section
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            background: 'var(--bg-paper)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <h1 className="serif-h2" style={{ marginBottom: '0.5rem' }}>
            No items in your bag to preview
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Add one or more sarees, unstitched dress materials, or fabrics to your bag to experience
            the checkout summary preview.
          </p>
          <Link to="/collections/sarees" className="btn btn-primary">
            Explore Sarees
          </Link>
        </section>
      ) : isPreviewSubmitted ? (
        /* Receipt-Style Demo Order Preview Card — Prompts 210–215 */
        <section
          aria-labelledby="preview-receipt-heading"
          style={{
            maxWidth: '820px',
            marginInline: 'auto',
            background: 'var(--bg-paper)',
            border: '1.5px solid var(--brand-plum)',
            borderRadius: 'var(--radius-xs)',
            padding: 'clamp(1.75rem, 4vw, 3rem)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={26} color="var(--brand-plum)" aria-hidden="true" />
              <div>
                <span className="eyebrow">Demo Receipt Preview</span>
                <h1 id="preview-receipt-heading" className="serif-h2">
                  Order Preview Complete — No Order Has Been Placed
                </h1>
              </div>
            </div>

            <span
              style={{
                background: 'var(--bg-plum-tint)',
                color: 'var(--brand-plum)',
                border: '1px solid rgba(76,32,90,0.3)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              DEMO PREVIEW ONLY
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            Below is the formatted summary of your selection. Because this is a non-transactional
            frontend concept, no charge has been made and no order has been dispatched. To place an
            actual order with Mahesh Designers in Tirupur, share this summary directly via WhatsApp.
          </p>

          {/* Customer & Address Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              padding: '1.25rem',
              background: 'var(--bg-ivory)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '1.5rem',
              fontSize: '0.88rem',
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.35rem' }}>
                Contact Details (In-Memory)
              </div>
              <div style={{ fontWeight: 600 }}>{form.fullName}</div>
              <div>Phone: {form.phone}</div>
              {form.email && <div>Email: {form.email}</div>}
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: '0.35rem' }}>
                Sample Delivery Destination
              </div>
              <div>{form.addressLine}</div>
              <div>
                {form.city}, {form.state} — {form.pinCode}
              </div>
              {form.notes && (
                <div style={{ marginTop: '0.35rem', color: 'var(--text-muted)' }}>
                  Note: &ldquo;{form.notes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Itemized Merchandise Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              Itemized Merchandise ({bagItemCount} {bagItemCount === 1 ? 'Unit' : 'Units'})
            </h2>

            <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {hydratedBagLines.map(({ product, quantity, lineTotalFormatted }) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    paddingBlock: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{product.displayTitle}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {product.productCode ? `Code: ${product.productCode} · ` : ''}
                      Qty {quantity} × {product.priceFormatted}
                    </div>
                  </div>
                  <div className="price-numeral">{lineTotalFormatted}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingTop: '1rem',
                fontSize: '1.05rem',
              }}
            >
              <span style={{ fontWeight: 600 }}>Illustrative Merchandise Subtotal</span>
              <span className="price-numeral" style={{ fontSize: '1.35rem' }}>
                {bagSubtotalFormatted}
              </span>
            </div>
          </div>

          {/* Handoff Actions */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <a
              href={buildDetailedWhatsAppInquiry()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>Send Order Inquiry on WhatsApp ({WHATSAPP_DISPLAY_NUMBER})</span>
            </a>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsPreviewSubmitted(false)}
            >
              Edit Preview Details
            </button>

            <Link
              to="/"
              onClick={() => clearBag()}
              className="btn btn-ghost"
              style={{ marginLeft: 'auto' }}
            >
              Clear Demo Bag &amp; Return Home
            </Link>
          </div>
        </section>
      ) : (
        /* Checkout Demo Form + Order Summary — Prompts 204–209 */
        <div className="checkout-grid">
          <form onSubmit={handleSubmit} noValidate aria-label="Demo checkout preview form">
            <div
              style={{
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                marginBottom: '1.5rem',
              }}
            >
              <span className="eyebrow">Step 1 · Contact &amp; Delivery</span>
              <h1 className="serif-h2" style={{ marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                Customer &amp; Sample Address Details
              </h1>

              <div className="form-group">
                <label className="form-label" htmlFor="checkout-fullName">
                  Full Name *
                </label>
                <input
                  id="checkout-fullName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kavitha Sundaram"
                  value={form.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'err-fullName' : undefined}
                />
                {errors.fullName && (
                  <p id="err-fullName" className="form-error" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-phone">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 98765 43210"
                    value={form.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'err-phone' : undefined}
                  />
                  {errors.phone && (
                    <p id="err-phone" className="form-error" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-email">
                    Email Address (Optional)
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'err-email' : undefined}
                  />
                  {errors.email && (
                    <p id="err-email" className="form-error" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="checkout-addressLine">
                  Street Address / Apartment *
                </label>
                <input
                  id="checkout-addressLine"
                  type="text"
                  className="form-input"
                  placeholder="Door number, street name, locality"
                  value={form.addressLine}
                  onChange={(e) => handleFieldChange('addressLine', e.target.value)}
                  aria-invalid={Boolean(errors.addressLine)}
                  aria-describedby={errors.addressLine ? 'err-addressLine' : undefined}
                />
                {errors.addressLine && (
                  <p id="err-addressLine" className="form-error" role="alert">
                    {errors.addressLine}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-city">
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Coimbatore"
                    value={form.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'err-city' : undefined}
                  />
                  {errors.city && (
                    <p id="err-city" className="form-error" role="alert">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-state">
                    State *
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    className="form-input"
                    value={form.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-pinCode">
                    PIN Code *
                  </label>
                  <input
                    id="checkout-pinCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="form-input"
                    placeholder="641604"
                    value={form.pinCode}
                    onChange={(e) => handleFieldChange('pinCode', e.target.value)}
                    aria-invalid={Boolean(errors.pinCode)}
                    aria-describedby={errors.pinCode ? 'err-pinCode' : undefined}
                  />
                  {errors.pinCode && (
                    <p id="err-pinCode" className="form-error" role="alert">
                      {errors.pinCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="checkout-notes">
                  Boutique Notes or Meterage Questions (Optional)
                </label>
                <textarea
                  id="checkout-notes"
                  className="form-textarea"
                  placeholder="Optional notes regarding drape preference, blouse fabric meterage, or gift packaging..."
                  value={form.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                />
              </div>
            </div>

            {/* Non-Selectable Shipping & Payment Explanation Blocks — Prompts 207 & 208 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    marginBottom: '0.4rem',
                  }}
                >
                  <Truck size={16} color="var(--brand-plum)" aria-hidden="true" />
                  <span>Shipping &amp; Dispatch</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Dispatch timelines and courier charges from Tirupur, Tamil Nadu are confirmed
                  directly by the boutique based on your destination PIN code.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    marginBottom: '0.4rem',
                  }}
                >
                  <Lock size={16} color="var(--brand-plum)" aria-hidden="true" />
                  <span>Payment Mode (Demo Only)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No online payment gateway (UPI, card, or netbanking) is enabled in this frontend
                  concept preview. No financial details are requested.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <Link to="/bag" className="btn-link">
                <ArrowLeft size={14} aria-hidden="true" />
                <span>Return to Shopping Bag</span>
              </Link>

              <button type="submit" className="btn btn-primary">
                <FileText size={16} aria-hidden="true" />
                <span>Preview Order Summary</span>
              </button>
            </div>
          </form>

          {/* Right Column: Merchandise Summary */}
          <aside className="summary-card" aria-label="Checkout bag summary">
            <span className="eyebrow">Order Summary</span>
            <h2 className="serif-h3" style={{ marginTop: '0.25rem', marginBottom: '1rem' }}>
              {hydratedBagLines.length} {hydratedBagLines.length === 1 ? 'Piece' : 'Pieces'} (
              {bagItemCount} {bagItemCount === 1 ? 'Unit' : 'Units'})
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                maxHeight: '360px',
                overflowY: 'auto',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {hydratedBagLines.map(({ product, quantity, lineTotalFormatted }) => (
                <div
                  key={product.id}
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                >
                  <img
                    src={product.media[0]?.thumbUrl}
                    alt={product.displayTitle}
                    style={{
                      width: '52px',
                      height: '68px',
                      objectFit: 'cover',
                      borderRadius: '2px',
                      border: '1px solid var(--border-subtle)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{product.displayTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty {quantity} × {product.priceFormatted}
                    </div>
                  </div>
                  <div className="price-numeral" style={{ fontSize: '0.88rem' }}>
                    {lineTotalFormatted}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingTop: '1rem',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Illustrative Merchandise Subtotal
              </span>
              <span className="price-numeral" style={{ fontSize: '1.25rem' }}>
                {bagSubtotalFormatted}
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

