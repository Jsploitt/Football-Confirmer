import { useState } from 'react'

const BANKS = [
  {
    id: 'alinma',
    name: 'Alinma Bank',
    color: '#c8972b',
    logo: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="14" fill="#c8972b" />
        <text x="14" y="19" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">أ</text>
      </svg>
    ),
    accountName: 'MOUTAZ FADI JABER',
    accountNumber: '68204617753000',
    iban: 'SA2205000068204617753000',
  },
  {
    id: 'stc',
    name: 'STC Bank',
    color: '#7c3aed',
    logo: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="14" fill="#7c3aed" />
        <text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">STC</text>
      </svg>
    ),
    accountName: 'MOUTAZ FADI RABAH JABER',
    phone: '+966538445831',
    accountNumber: '1116244458',
    iban: 'SA5178000000001116244458',
  },
]

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = value
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      className="copy-btn"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      style={{ '--bank-color': BANKS[0].color }}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

function BankCard({ bank, isActive, onSelect }) {
  return (
    <div
      className={`bank-card ${isActive ? 'bank-card--active' : ''}`}
      style={{ '--bank-color': bank.color }}
      onClick={() => onSelect(bank.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(bank.id)}
      aria-pressed={isActive}
    >
      {bank.logo}
      <span className="bank-card__name">{bank.name}</span>
      {isActive && (
        <svg className="bank-card__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  )
}

export default function PaymentSection() {
  const [activeBank, setActiveBank] = useState('alinma')
  const bank = BANKS.find(b => b.id === activeBank)

  return (
    <div className="section">
      <div className="section-title">Pay Your Share</div>
      <div className="payment-card" style={{ '--bank-color': bank.color }}>
        <p className="payment-hint">Transfer your share directly to Moutaz</p>

        <div className="bank-tabs">
          {BANKS.map(b => (
            <BankCard
              key={b.id}
              bank={b}
              isActive={activeBank === b.id}
              onSelect={setActiveBank}
            />
          ))}
        </div>

        <div className="payment-fields">
          <div className="payment-field">
            <span className="payment-field__label">Account Name</span>
            <div className="payment-field__row">
              <span className="payment-field__value">{bank.accountName}</span>
              <CopyButton value={bank.accountName} />
            </div>
          </div>
          {bank.phone && (
            <div className="payment-field">
              <span className="payment-field__label">Phone Number</span>
              <div className="payment-field__row">
                <span className="payment-field__value">{bank.phone}</span>
                <CopyButton value={bank.phone} />
              </div>
            </div>
          )}
          <div className="payment-field">
            <span className="payment-field__label">Account Number</span>
            <div className="payment-field__row">
              <span className="payment-field__value">{bank.accountNumber}</span>
              <CopyButton value={bank.accountNumber} />
            </div>
          </div>
          <div className="payment-field">
            <span className="payment-field__label">IBAN</span>
            <div className="payment-field__row">
              <span className="payment-field__value payment-field__value--iban">{bank.iban}</span>
              <CopyButton value={bank.iban} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
