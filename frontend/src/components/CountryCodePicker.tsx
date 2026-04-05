import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface CountryCode {
  code: string;       // ISO 3166-1 alpha-2
  name: string;
  dialCode: string;   // e.g. "+49"
  flag: string;       // emoji flag
  format: string;     // placeholder format e.g. "XXX XXX XXXX"
}

/**
 * Comprehensive list of country calling codes.
 * Source: ITU-T E.164 / Google i18n phone data
 */
export const COUNTRY_CODES: CountryCode[] = [
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '\u{1F1E6}\u{1F1EB}', format: 'XX XXX XXXX' },
  { code: 'AL', name: 'Albania', dialCode: '+355', flag: '\u{1F1E6}\u{1F1F1}', format: 'XX XXX XXXX' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '\u{1F1E9}\u{1F1FF}', format: 'XXX XX XX XX' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '\u{1F1E6}\u{1F1F7}', format: 'XX XXXX XXXX' },
  { code: 'AM', name: 'Armenia', dialCode: '+374', flag: '\u{1F1E6}\u{1F1F2}', format: 'XX XXXXXX' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '\u{1F1E6}\u{1F1FA}', format: 'XXX XXX XXX' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '\u{1F1E6}\u{1F1F9}', format: 'XXX XXXXXXX' },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994', flag: '\u{1F1E6}\u{1F1FF}', format: 'XX XXX XXXX' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '\u{1F1E7}\u{1F1ED}', format: 'XXXX XXXX' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '\u{1F1E7}\u{1F1E9}', format: 'XXXX XXXXXX' },
  { code: 'BY', name: 'Belarus', dialCode: '+375', flag: '\u{1F1E7}\u{1F1FE}', format: 'XX XXX XX XX' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '\u{1F1E7}\u{1F1EA}', format: 'XXX XX XX XX' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '\u{1F1E7}\u{1F1F7}', format: 'XX XXXXX XXXX' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '\u{1F1E7}\u{1F1EC}', format: 'XX XXX XXXX' },
  { code: 'KH', name: 'Cambodia', dialCode: '+855', flag: '\u{1F1F0}\u{1F1ED}', format: 'XX XXX XXX' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '\u{1F1E8}\u{1F1E6}', format: 'XXX XXX XXXX' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '\u{1F1E8}\u{1F1F1}', format: 'X XXXX XXXX' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '\u{1F1E8}\u{1F1F3}', format: 'XXX XXXX XXXX' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '\u{1F1E8}\u{1F1F4}', format: 'XXX XXX XXXX' },
  { code: 'HR', name: 'Croatia', dialCode: '+385', flag: '\u{1F1ED}\u{1F1F7}', format: 'XX XXX XXXX' },
  { code: 'CY', name: 'Cyprus', dialCode: '+357', flag: '\u{1F1E8}\u{1F1FE}', format: 'XX XXXXXX' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '\u{1F1E8}\u{1F1FF}', format: 'XXX XXX XXX' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '\u{1F1E9}\u{1F1F0}', format: 'XX XX XX XX' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '\u{1F1EA}\u{1F1EC}', format: 'XX XXXX XXXX' },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '\u{1F1EA}\u{1F1EA}', format: 'XXXX XXXX' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '\u{1F1EA}\u{1F1F9}', format: 'XX XXX XXXX' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '\u{1F1EB}\u{1F1EE}', format: 'XX XXX XXXX' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '\u{1F1EB}\u{1F1F7}', format: 'X XX XX XX XX' },
  { code: 'GE', name: 'Georgia', dialCode: '+995', flag: '\u{1F1EC}\u{1F1EA}', format: 'XXX XX XX XX' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '\u{1F1E9}\u{1F1EA}', format: 'XXX XXXXXXX' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '\u{1F1EC}\u{1F1ED}', format: 'XX XXX XXXX' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '\u{1F1EC}\u{1F1F7}', format: 'XXX XXX XXXX' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '\u{1F1ED}\u{1F1F0}', format: 'XXXX XXXX' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '\u{1F1ED}\u{1F1FA}', format: 'XX XXX XXXX' },
  { code: 'IS', name: 'Iceland', dialCode: '+354', flag: '\u{1F1EE}\u{1F1F8}', format: 'XXX XXXX' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '\u{1F1EE}\u{1F1F3}', format: 'XXXXX XXXXX' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '\u{1F1EE}\u{1F1E9}', format: 'XXX XXXX XXXX' },
  { code: 'IR', name: 'Iran', dialCode: '+98', flag: '\u{1F1EE}\u{1F1F7}', format: 'XXX XXX XXXX' },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '\u{1F1EE}\u{1F1F6}', format: 'XXX XXX XXXX' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '\u{1F1EE}\u{1F1EA}', format: 'XX XXX XXXX' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '\u{1F1EE}\u{1F1F1}', format: 'XX XXX XXXX' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '\u{1F1EE}\u{1F1F9}', format: 'XXX XXX XXXX' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '\u{1F1EF}\u{1F1F5}', format: 'XX XXXX XXXX' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '\u{1F1EF}\u{1F1F4}', format: 'X XXXX XXXX' },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7', flag: '\u{1F1F0}\u{1F1FF}', format: 'XXX XXX XX XX' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '\u{1F1F0}\u{1F1EA}', format: 'XXX XXXXXX' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '\u{1F1F0}\u{1F1FC}', format: 'XXXX XXXX' },
  { code: 'LV', name: 'Latvia', dialCode: '+371', flag: '\u{1F1F1}\u{1F1FB}', format: 'XX XXX XXX' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '\u{1F1F1}\u{1F1E7}', format: 'XX XXX XXX' },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', flag: '\u{1F1F1}\u{1F1F9}', format: 'XXX XXXXX' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '\u{1F1F1}\u{1F1FA}', format: 'XXX XXX XXX' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '\u{1F1F2}\u{1F1FE}', format: 'XX XXXX XXXX' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '\u{1F1F2}\u{1F1FD}', format: 'XX XXXX XXXX' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '\u{1F1F2}\u{1F1E6}', format: 'XXX XXXXXX' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '\u{1F1F3}\u{1F1F1}', format: 'X XXXXXXXX' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '\u{1F1F3}\u{1F1FF}', format: 'XX XXX XXXX' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '\u{1F1F3}\u{1F1EC}', format: 'XXX XXX XXXX' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '\u{1F1F3}\u{1F1F4}', format: 'XXX XX XXX' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '\u{1F1F4}\u{1F1F2}', format: 'XXXX XXXX' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '\u{1F1F5}\u{1F1F0}', format: 'XXX XXXXXXX' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '\u{1F1F5}\u{1F1EA}', format: 'XXX XXX XXX' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '\u{1F1F5}\u{1F1ED}', format: 'XXX XXX XXXX' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '\u{1F1F5}\u{1F1F1}', format: 'XXX XXX XXX' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '\u{1F1F5}\u{1F1F9}', format: 'XXX XXX XXX' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '\u{1F1F6}\u{1F1E6}', format: 'XXXX XXXX' },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '\u{1F1F7}\u{1F1F4}', format: 'XXX XXX XXX' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '\u{1F1F7}\u{1F1FA}', format: 'XXX XXX XX XX' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '\u{1F1F8}\u{1F1E6}', format: 'XX XXX XXXX' },
  { code: 'RS', name: 'Serbia', dialCode: '+381', flag: '\u{1F1F7}\u{1F1F8}', format: 'XX XXX XXXX' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '\u{1F1F8}\u{1F1EC}', format: 'XXXX XXXX' },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', flag: '\u{1F1F8}\u{1F1F0}', format: 'XXX XXX XXX' },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', flag: '\u{1F1F8}\u{1F1EE}', format: 'XX XXX XXX' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '\u{1F1FF}\u{1F1E6}', format: 'XX XXX XXXX' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '\u{1F1F0}\u{1F1F7}', format: 'XX XXXX XXXX' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '\u{1F1EA}\u{1F1F8}', format: 'XXX XXX XXX' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '\u{1F1F1}\u{1F1F0}', format: 'XX XXX XXXX' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '\u{1F1F8}\u{1F1EA}', format: 'XX XXX XXXX' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '\u{1F1E8}\u{1F1ED}', format: 'XX XXX XX XX' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '\u{1F1F9}\u{1F1FC}', format: 'XXX XXX XXX' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '\u{1F1F9}\u{1F1ED}', format: 'XX XXX XXXX' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '\u{1F1F9}\u{1F1F7}', format: 'XXX XXX XXXX' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '\u{1F1FA}\u{1F1E6}', format: 'XX XXX XXXX' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '\u{1F1E6}\u{1F1EA}', format: 'XX XXX XXXX' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '\u{1F1EC}\u{1F1E7}', format: 'XXXX XXXXXX' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '\u{1F1FA}\u{1F1F8}', format: 'XXX XXX XXXX' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '\u{1F1FB}\u{1F1F3}', format: 'XX XXXX XXX' },
];

// Default to Finland (Zalaris is Nordic)
const DEFAULT_COUNTRY = COUNTRY_CODES.find(c => c.code === 'FI')!;

interface Props {
  value: string;                      // full phone: "+49 170 1234567"
  onChange: (fullPhone: string) => void;
  className?: string;
}

export function CountryCodePicker({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Parse existing value to extract country + local number
  const parsed = parsePhone(value);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(parsed.country);
  const [localNumber, setLocalNumber] = useState(parsed.local);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync when value prop changes externally
  useEffect(() => {
    const p = parsePhone(value);
    setSelectedCountry(p.country);
    setLocalNumber(p.local);
  }, [value]);

  const filtered = COUNTRY_CODES.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.code.toLowerCase().includes(q);
  });

  function handleCountrySelect(c: CountryCode) {
    setSelectedCountry(c);
    setOpen(false);
    setSearch('');
    onChange(localNumber ? `${c.dialCode} ${localNumber}` : '');
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^0-9 ]/g, '');
    setLocalNumber(val);
    onChange(val ? `${selectedCountry.dialCode} ${val}` : '');
  }

  return (
    <div ref={ref} className={`flex gap-0 ${className || ''}`}>
      {/* Country code button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-surface-container-low rounded-l-xl px-3 py-3 text-sm font-medium hover:bg-surface-container transition-colors border-r border-outline-variant/10 whitespace-nowrap flex-shrink-0"
      >
        <span className="text-base">{selectedCountry.flag}</span>
        <span className="text-on-surface-variant">{selectedCountry.dialCode}</span>
        <ChevronDown size={14} className={`text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Phone number input */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleLocalChange}
        placeholder={selectedCountry.format}
        className="flex-1 bg-surface-container-low border-none rounded-r-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all min-w-0"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-12 bg-white rounded-xl shadow-xl border border-surface-container w-72 max-h-72 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-surface-container">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2">
              <Search size={14} className="text-on-surface-variant flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country..."
                className="bg-transparent text-sm outline-none w-full"
                autoFocus
              />
            </div>
          </div>
          {/* List */}
          <div className="overflow-y-auto flex-1">
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountrySelect(c)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-surface-container-low transition-colors ${
                  c.code === selectedCountry.code ? 'bg-primary/10 text-primary font-semibold' : ''
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-on-surface-variant text-xs">{c.dialCode}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">No countries found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Parse a full phone string like "+49 170 1234567" into country + local */
function parsePhone(phone: string): { country: CountryCode; local: string } {
  if (!phone || !phone.startsWith('+')) return { country: DEFAULT_COUNTRY, local: '' };

  // Try longest dial code first (e.g. "+971" before "+97")
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (phone.startsWith(c.dialCode)) {
      return { country: c, local: phone.slice(c.dialCode.length).trim() };
    }
  }
  return { country: DEFAULT_COUNTRY, local: phone.replace(/^\+\d+\s*/, '') };
}
