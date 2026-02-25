import React, { useState, useRef, useEffect } from 'react';
import { useSiteConfig } from '../shared/siteConfig';
import { notify } from '../shared/notify';

interface Props {
  onSubmit: (
    mode: 'LOGIN' | 'SIGNUP',
    payload: any
  ) => void;
  embedded?: boolean;
  initialMode?: 'LOGIN' | 'SIGNUP';
}

export const UserAuthScreen: React.FC<Props> = ({ onSubmit, embedded, initialMode }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(initialMode || 'LOGIN');
  const { config } = useSiteConfig();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [confirm, setConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+880');
  const [countryFlag, setCountryFlag] = useState('🇧🇩');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [highlightCountryIndex, setHighlightCountryIndex] = useState<number>(-1);
  const countryWrapperRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [referral, setReferral] = useState('');
  const [referralMode, setReferralMode] = useState<'EDIT' | 'NONE'>('NONE');
  const [referralDropdownOpen, setReferralDropdownOpen] = useState(false);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [birthdate, setBirthdate] = useState<string>('');
  const [accept, setAccept] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const emailDomains = ['gmail.com','outlook.com','yahoo.com','hotmail.com','icloud.com','proton.me','aol.com'];

  const countryCodes = [
    { code: '+93', label: 'Afghanistan', flag: '🇦🇫' },
    { code: '+355', label: 'Albania', flag: '🇦🇱' },
    { code: '+213', label: 'Algeria', flag: '🇩🇿' },
    { code: '+1-684', label: 'American Samoa', flag: '🇦🇸' },
    { code: '+376', label: 'Andorra', flag: '🇦🇩' },
    { code: '+244', label: 'Angola', flag: '🇦🇴' },
    { code: '+1-264', label: 'Anguilla', flag: '🇦🇮' },
    { code: '+672', label: 'Antarctica', flag: '🇦🇶' },
    { code: '+1-268', label: 'Antigua & Barbuda', flag: '🇦🇬' },
    { code: '+54', label: 'Argentina', flag: '🇦🇷' },
    { code: '+374', label: 'Armenia', flag: '🇦🇲' },
    { code: '+297', label: 'Aruba', flag: '🇦🇼' },
    { code: '+61', label: 'Australia', flag: '🇦🇺' },
    { code: '+43', label: 'Austria', flag: '🇦🇹' },
    { code: '+994', label: 'Azerbaijan', flag: '🇦🇿' },
    { code: '+1-242', label: 'Bahamas', flag: '🇧🇸' },
    { code: '+973', label: 'Bahrain', flag: '🇧🇭' },
    { code: '+880', label: 'Bangladesh', flag: '🇧🇩' },
    { code: '+1-246', label: 'Barbados', flag: '🇧🇧' },
    { code: '+375', label: 'Belarus', flag: '🇧🇾' },
    { code: '+32', label: 'Belgium', flag: '🇧🇪' },
    { code: '+501', label: 'Belize', flag: '🇧🇿' },
    { code: '+229', label: 'Benin', flag: '🇧🇯' },
    { code: '+1-441', label: 'Bermuda', flag: '🇧🇲' },
    { code: '+975', label: 'Bhutan', flag: '🇧🇹' },
    { code: '+591', label: 'Bolivia', flag: '🇧🇴' },
    { code: '+387', label: 'Bosnia & Herzegovina', flag: '🇧🇦' },
    { code: '+267', label: 'Botswana', flag: '🇧🇼' },
    { code: '+55', label: 'Brazil', flag: '🇧🇷' },
    { code: '+1-284', label: 'British Virgin Islands', flag: '🇻🇬' },
    { code: '+673', label: 'Brunei', flag: '🇧🇳' },
    { code: '+359', label: 'Bulgaria', flag: '🇧🇬' },
    { code: '+226', label: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+257', label: 'Burundi', flag: '🇧🇮' },
    { code: '+855', label: 'Cambodia', flag: '🇰🇭' },
    { code: '+237', label: 'Cameroon', flag: '🇨🇲' },
    { code: '+1', label: 'Canada', flag: '🇨🇦' },
    { code: '+238', label: 'Cape Verde', flag: '🇨🇻' },
    { code: '+1-345', label: 'Cayman Islands', flag: '🇰🇾' },
    { code: '+236', label: 'Central African Republic', flag: '🇨🇫' },
    { code: '+235', label: 'Chad', flag: '🇹🇩' },
    { code: '+56', label: 'Chile', flag: '🇨🇱' },
    { code: '+86', label: 'China', flag: '🇨🇳' },
    { code: '+61', label: 'Christmas Island', flag: '🇨🇽' },
    { code: '+61', label: 'Cocos (Keeling) Islands', flag: '🇨🇨' },
    { code: '+57', label: 'Colombia', flag: '🇨🇴' },
    { code: '+269', label: 'Comoros', flag: '🇰🇲' },
    { code: '+243', label: 'Congo (DRC)', flag: '🇨🇩' },
    { code: '+242', label: 'Congo (Republic)', flag: '🇨🇬' },
    { code: '+682', label: 'Cook Islands', flag: '🇨🇰' },
    { code: '+506', label: 'Costa Rica', flag: '🇨🇷' },
    { code: '+385', label: 'Croatia', flag: '🇭🇷' },
    { code: '+53', label: 'Cuba', flag: '🇨🇺' },
    { code: '+357', label: 'Cyprus', flag: '🇨🇾' },
    { code: '+420', label: 'Czechia', flag: '🇨🇿' },
    { code: '+45', label: 'Denmark', flag: '🇩🇰' },
    { code: '+253', label: 'Djibouti', flag: '🇩🇯' },
    { code: '+1-767', label: 'Dominica', flag: '🇩🇲' },
    { code: '+1-809', label: 'Dominican Republic', flag: '🇩🇴' },
    { code: '+593', label: 'Ecuador', flag: '🇪🇨' },
    { code: '+20', label: 'Egypt', flag: '🇪🇬' },
    { code: '+503', label: 'El Salvador', flag: '🇸🇻' },
    { code: '+240', label: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+291', label: 'Eritrea', flag: '🇪🇷' },
    { code: '+372', label: 'Estonia', flag: '🇪🇪' },
    { code: '+251', label: 'Ethiopia', flag: '🇪🇹' },
    { code: '+679', label: 'Fiji', flag: '🇫🇯' },
    { code: '+358', label: 'Finland', flag: '🇫🇮' },
    { code: '+33', label: 'France', flag: '🇫🇷' },
    { code: '+594', label: 'French Guiana', flag: '🇬🇫' },
    { code: '+241', label: 'Gabon', flag: '🇬🇦' },
    { code: '+220', label: 'Gambia', flag: '🇬🇲' },
    { code: '+995', label: 'Georgia', flag: '🇬🇪' },
    { code: '+49', label: 'Germany', flag: '🇩🇪' },
    { code: '+233', label: 'Ghana', flag: '🇬🇭' },
    { code: '+350', label: 'Gibraltar', flag: '🇬🇮' },
    { code: '+30', label: 'Greece', flag: '🇬🇷' },
    { code: '+299', label: 'Greenland', flag: '🇬🇱' },
    { code: '+1-473', label: 'Grenada', flag: '🇬🇩' },
    { code: '+590', label: 'Guadeloupe', flag: '🇬🇵' },
    { code: '+592', label: 'Guyana', flag: '🇬🇾' },
    { code: '+502', label: 'Guatemala', flag: '🇬🇹' },
    { code: '+224', label: 'Guinea', flag: '🇬🇳' },
    { code: '+245', label: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: '+240', label: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+592', label: 'Guyana', flag: '🇬🇾' },
    { code: '+504', label: 'Honduras', flag: '🇭🇳' },
    { code: '+852', label: 'Hong Kong', flag: '🇭🇰' },
    { code: '+36', label: 'Hungary', flag: '🇭🇺' },
    { code: '+354', label: 'Iceland', flag: '🇮🇸' },
    { code: '+91', label: 'India', flag: '🇮🇳' },
    { code: '+62', label: 'Indonesia', flag: '🇮🇩' },
    { code: '+98', label: 'Iran', flag: '🇮🇷' },
    { code: '+964', label: 'Iraq', flag: '🇮🇶' },
    { code: '+353', label: 'Ireland', flag: '🇮🇪' },
    { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
    { code: '+972', label: 'Israel', flag: '🇮🇱' },
    { code: '+39', label: 'Italy', flag: '🇮🇹' },
    { code: '+1-876', label: 'Jamaica', flag: '🇯🇲' },
    { code: '+81', label: 'Japan', flag: '🇯🇵' },
    { code: '+962', label: 'Jordan', flag: '🇯🇴' },
    { code: '+7', label: 'Kazakhstan/Russia', flag: '🇰🇿' },
    { code: '+254', label: 'Kenya', flag: '🇰🇪' },
    { code: '+686', label: 'Kiribati', flag: '🇰🇮' },
    { code: '+383', label: 'Kosovo', flag: '🇽🇰' },
    { code: '+965', label: 'Kuwait', flag: '🇰🇼' },
    { code: '+996', label: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: '+856', label: 'Laos', flag: '🇱🇦' },
    { code: '+371', label: 'Latvia', flag: '🇱🇻' },
    { code: '+423', label: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+370', label: 'Lithuania', flag: '🇱🇹' },
    { code: '+352', label: 'Luxembourg', flag: '🇱🇺' },
    { code: '+853', label: 'Macao', flag: '🇲🇴' },
    { code: '+389', label: 'North Macedonia', flag: '🇲🇰' },
    { code: '+261', label: 'Madagascar', flag: '🇲🇬' },
    { code: '+265', label: 'Malawi', flag: '🇲🇼' },
    { code: '+60', label: 'Malaysia', flag: '🇲🇾' },
    { code: '+960', label: 'Maldives', flag: '🇲🇻' },
    { code: '+223', label: 'Mali', flag: '🇲🇱' },
    { code: '+356', label: 'Malta', flag: '🇲🇹' },
    { code: '+692', label: 'Marshall Islands', flag: '🇲🇭' },
    { code: '+596', label: 'Martinique', flag: '🇲🇶' },
    { code: '+222', label: 'Mauritania', flag: '🇲🇷' },
    { code: '+230', label: 'Mauritius', flag: '🇲🇺' },
    { code: '+52', label: 'Mexico', flag: '🇲🇽' },
    { code: '+691', label: 'Micronesia', flag: '🇫🇲' },
    { code: '+373', label: 'Moldova', flag: '🇲🇩' },
    { code: '+377', label: 'Monaco', flag: '🇲🇨' },
    { code: '+976', label: 'Mongolia', flag: '🇲🇳' },
    { code: '+382', label: 'Montenegro', flag: '🇲🇪' },
    { code: '+212', label: 'Morocco', flag: '🇲🇦' },
    { code: '+258', label: 'Mozambique', flag: '🇲🇿' },
    { code: '+95', label: 'Myanmar', flag: '🇲🇲' },
    { code: '+264', label: 'Namibia', flag: '🇳🇦' },
    { code: '+674', label: 'Nauru', flag: '🇳🇷' },
    { code: '+977', label: 'Nepal', flag: '🇳🇵' },
    { code: '+31', label: 'Netherlands', flag: '🇳🇱' },
    { code: '+687', label: 'New Caledonia', flag: '🇳🇨' },
    { code: '+64', label: 'New Zealand', flag: '🇳🇿' },
    { code: '+505', label: 'Nicaragua', flag: '🇳🇮' },
    { code: '+227', label: 'Niger', flag: '🇳🇪' },
    { code: '+234', label: 'Nigeria', flag: '🇳🇬' },
    { code: '+47', label: 'Norway', flag: '🇳🇴' },
    { code: '+968', label: 'Oman', flag: '🇴🇲' },
    { code: '+92', label: 'Pakistan', flag: '🇵🇰' },
    { code: '+680', label: 'Palau', flag: '🇵🇼' },
    { code: '+507', label: 'Panama', flag: '🇵🇦' },
    { code: '+675', label: 'Papua New Guinea', flag: '🇵🇬' },
    { code: '+595', label: 'Paraguay', flag: '🇵🇾' },
    { code: '+51', label: 'Peru', flag: '🇵🇪' },
    { code: '+63', label: 'Philippines', flag: '🇵🇭' },
    { code: '+48', label: 'Poland', flag: '🇵🇱' },
    { code: '+351', label: 'Portugal', flag: '🇵🇹' },
    { code: '+1', label: 'Puerto Rico', flag: '🇵🇷' },
    { code: '+974', label: 'Qatar', flag: '🇶🇦' },
    { code: '+262', label: 'Réunion', flag: '🇷🇪' },
    { code: '+40', label: 'Romania', flag: '🇷🇴' },
    { code: '+7', label: 'Russia', flag: '🇷🇺' },
    { code: '+250', label: 'Rwanda', flag: '🇷🇼' },
    { code: '+685', label: 'Samoa', flag: '🇼🇸' },
    { code: '+378', label: 'San Marino', flag: '🇸🇲' },
    { code: '+239', label: 'Sao Tome & Principe', flag: '🇸🇹' },
    { code: '+966', label: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+221', label: 'Senegal', flag: '🇸🇳' },
    { code: '+381', label: 'Serbia', flag: '🇷🇸' },
    { code: '+65', label: 'Singapore', flag: '🇸🇬' },
    { code: '+683', label: 'Niue', flag: '🇳🇺' },
    { code: '+421', label: 'Slovakia', flag: '🇸🇰' },
    { code: '+386', label: 'Slovenia', flag: '🇸🇮' },
    { code: '+677', label: 'Solomon Islands', flag: '🇸🇧' },
    { code: '+252', label: 'Somalia', flag: '🇸🇴' },
    { code: '+27', label: 'South Africa', flag: '🇿🇦' },
    { code: '+82', label: 'South Korea', flag: '🇰🇷' },
    { code: '+211', label: 'South Sudan', flag: '🇸🇸' },
    { code: '+34', label: 'Spain', flag: '🇪🇸' },
    { code: '+94', label: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+249', label: 'Sudan', flag: '🇸🇩' },
    { code: '+597', label: 'Suriname', flag: '🇸🇷' },
    { code: '+46', label: 'Sweden', flag: '🇸🇪' },
    { code: '+41', label: 'Switzerland', flag: '🇨🇭' },
    { code: '+963', label: 'Syria', flag: '🇸🇾' },
    { code: '+886', label: 'Taiwan', flag: '🇹🇼' },
    { code: '+992', label: 'Tajikistan', flag: '🇹🇯' },
    { code: '+255', label: 'Tanzania', flag: '🇹🇿' },
    { code: '+66', label: 'Thailand', flag: '🇹🇭' },
    { code: '+670', label: 'Timor-Leste', flag: '🇹🇱' },
    { code: '+228', label: 'Togo', flag: '🇹🇬' },
    { code: '+676', label: 'Tonga', flag: '🇹🇴' },
    { code: '+1-868', label: 'Trinidad & Tobago', flag: '🇹🇹' },
    { code: '+216', label: 'Tunisia', flag: '🇹🇳' },
    { code: '+90', label: 'Turkey', flag: '🇹🇷' },
    { code: '+993', label: 'Turkmenistan', flag: '🇹🇲' },
    { code: '+688', label: 'Tuvalu', flag: '🇹🇻' },
    { code: '+256', label: 'Uganda', flag: '🇺🇬' },
    { code: '+380', label: 'Ukraine', flag: '🇺🇦' },
    { code: '+971', label: 'United Arab Emirates', flag: '🇦🇪' },
    { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
    { code: '+1', label: 'United States', flag: '🇺🇸' },
    { code: '+598', label: 'Uruguay', flag: '🇺🇾' },
    { code: '+998', label: 'Uzbekistan', flag: '🇺🇿' },
    { code: '+678', label: 'Vanuatu', flag: '🇻🇺' },
    { code: '+58', label: 'Venezuela', flag: '🇻🇪' },
    { code: '+84', label: 'Vietnam', flag: '🇻🇳' },
    { code: '+681', label: 'Wallis & Futuna', flag: '🇼🇫' },
    { code: '+970', label: 'West Bank', flag: '🇵🇸' },
    { code: '+260', label: 'Zambia', flag: '🇿🇲' },
    { code: '+263', label: 'Zimbabwe', flag: '🇿🇼' },
  ];
  // inputs should be block-level; remove flex to avoid layout differences
  const inputClass = "w-full h-10 rounded-lg bg-black/40 border border-emerald-400/20 px-3 text-xs focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";
  // Prominent inputs (email & password) should match visually: taller, larger text and padding
  // give larger right padding so the password visibility icon doesn't look cramped
  const prominentInputClass = `${inputClass} h-12 text-sm pl-4 pr-20`;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!countryDropdownOpen) return;
      const el = countryWrapperRef.current;
      if (el && !el.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
        setCountrySearch('');
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setCountryDropdownOpen(false);
        setCountrySearch('');
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [countryDropdownOpen]);

  useEffect(() => {
    if (countryDropdownOpen) {
      // focus the search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [countryDropdownOpen]);

  // compute filtered list for use in multiple places
  const filteredCountries = countryCodes.filter(c => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return c.label.toLowerCase().includes(q) || c.code.replace(/[^0-9+\-]/g, '').includes(q.replace(/[^0-9+\-]/g, ''));
  });

  function updateEmailSuggestions(value: string) {
    const parts = value.split('@');
    const local = parts[0] || '';
    const frag = parts[1] || '';
    if (!local) { setEmailSuggestions([]); return; }
    let suggestions: string[] = [];
    if (!frag) {
      suggestions = emailDomains.map(d => `${local}@${d}`);
    } else {
      suggestions = emailDomains.filter(d => d.startsWith(frag)).map(d => `${local}@${d}`);
    }
    setEmailSuggestions(suggestions.slice(0,6));
    setHighlightIndex(-1);
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showEmailSuggestions || emailSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => (i + 1) >= emailSuggestions.length ? 0 : i + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => (i - 1) < 0 ? emailSuggestions.length - 1 : i - 1);
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < emailSuggestions.length) {
        e.preventDefault();
        setEmail(emailSuggestions[highlightIndex]);
        setShowEmailSuggestions(false);
        setHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowEmailSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      notify.error('Email and password are required');
      return;
    }
    if (!isEmail(email)) {
      notify.error('Please enter a valid email');
      return;
    }
    if (password.length < 8) {
      notify.error('Password must be at least 8 characters');
      return;
    }
    if (mode === 'SIGNUP') {
      if (!name) { notify.error('Please enter your full name'); return; }
      if (password !== confirm) { notify.error('Passwords do not match'); return; }
      if (!accept) { notify.error('You must accept the Terms & Conditions'); return; }
    }
    setLoading(true);
    const referralValue = referralMode === 'EDIT' && referral.trim() ? referral.trim() : undefined;
    const phoneValue = phone.trim() ? `${countryCode}${phone.trim()}` : undefined;
    onSubmit(mode, { email: email.trim(), password, name: name.trim() || undefined, remember, phone: phoneValue, referral: referralValue, gender: gender || undefined, birthdate: birthdate || undefined });
    setLoading(false);
  };

  function handlePhoneInputChange(value: string) {
    // If the user types a leading country code (e.g. +91 or +1-242), open dropdown and set search.
    const v = value || '';
    const match = v.trim().match(/^\+?[0-9\-]+/);
    if (match && v.trim().startsWith('+')) {
      const code = match[0];
      setCountrySearch(code);
      setCountryDropdownOpen(true);
      // remove the matched code from phone input so user continues typing the local number
      const rest = v.trim().slice(code.length).trimStart();
      setPhone(rest);
      return;
    }
    // otherwise treat as local number
    setPhone(value);
  }

  const formContent = (
    <div className="w-full max-w-xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/60 p-6 sm:p-10 space-y-6 mx-auto mt-8 sm:mt-16" style={{ minWidth: 0 }}>
      <div className="pt-4 text-center space-y-2">
        {mode === 'SIGNUP' ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Create your account at <span className="text-emerald-400">{config.siteName}</span></h1>
            <p className="text-sm text-slate-400">Fast signup — complete verification later in your profile.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Log in to <span className="text-emerald-400">{config.siteName}</span></h1>
            <p className="text-sm text-slate-400">Welcome back — enter your credentials to access your account.</p>
          </>
        )}
      </div>

      {/* in-form tabs (Login / Registration) like screenshot */}
      <div className="w-full max-w-xl mx-auto mt-4 flex items-center justify-center">
        <div className="rounded-md bg-slate-800/50 p-1 flex gap-2">
          <button type="button" onClick={() => setMode('LOGIN')} className={`px-6 py-2 rounded-md font-semibold ${mode === 'LOGIN' ? 'bg-slate-900 text-white shadow-inner' : 'text-slate-300'}`}>
            Login
          </button>
          <button type="button" onClick={() => setMode('SIGNUP')} className={`px-6 py-2 rounded-md font-semibold ${mode === 'SIGNUP' ? 'bg-slate-900 text-white shadow-inner' : 'text-slate-300'}`}>
            Registration
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mode === 'SIGNUP' && (
            <div className="space-y-1">
              <label htmlFor="auth-name" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Full name</label>
              <input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputClass} />
            </div>
          )}

          {mode === 'SIGNUP' && (
            <div className="space-y-1">
              <label htmlFor="auth-birthdate" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Birthdate</label>
              <input id="auth-birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className={`${inputClass}`} />
            </div>
          )}

          <div className="space-y-1 sm:col-span-2 relative">
            <label htmlFor="auth-email" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); updateEmailSuggestions(e.target.value); setShowEmailSuggestions(true); }}
              onFocus={() => { updateEmailSuggestions(email); setShowEmailSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 150)}
              onKeyDown={handleEmailKeyDown}
              placeholder="Enter your email"
              aria-controls="email-suggestions"
              aria-expanded={showEmailSuggestions}
              className={prominentInputClass}
            />

            {showEmailSuggestions && emailSuggestions.length > 0 && (
              <div id="email-suggestions" role="listbox" className="absolute left-0 right-0 mt-1 z-30 bg-[#0b0d0f] border border-slate-800 rounded-md overflow-hidden">
                {emailSuggestions.map((s, idx) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setEmail(s); setShowEmailSuggestions(false); setHighlightIndex(-1); }}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    role="option"
                    aria-selected={highlightIndex === idx}
                    className={`w-full text-left px-3 py-2 text-xs ${highlightIndex === idx ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>

          {mode === 'SIGNUP' && (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Phone (optional)</label>
              <div className="flex items-center gap-2">
                <div className="relative" ref={countryWrapperRef}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setCountryDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 h-10 w-28 rounded-lg bg-black/20 border border-slate-800 text-xs cursor-pointer"
                  >
                    <span className="h-6 w-6 rounded-full overflow-hidden flex items-center justify-center bg-white/5 text-sm">{countryFlag}</span>
                    <span className="font-mono">{countryCode}</span>
                    <i className="fa-solid fa-chevron-down text-[11px] text-slate-400"></i>
                  </div>
                  {countryDropdownOpen && (
                    <div className="absolute mt-1 left-0 w-full sm:w-44 bg-[#0b0d0f] border border-slate-800 rounded-md shadow-lg z-50 overflow-auto max-h-60">
                      <div className="px-2 py-2">
                        <input
                          ref={searchInputRef}
                          type="search"
                          value={countrySearch}
                          onChange={(e) => { setCountrySearch(e.target.value); setHighlightCountryIndex(0); }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setHighlightCountryIndex(i => {
                                const next = Math.min((i < 0 ? -1 : i) + 1, Math.max(0, filteredCountries.length - 1));
                                return next;
                              });
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setHighlightCountryIndex(i => {
                                const prev = (i <= 0) ? Math.max(0, filteredCountries.length - 1) : i - 1;
                                return prev;
                              });
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              const idx = highlightCountryIndex >= 0 ? highlightCountryIndex : 0;
                              const sel = filteredCountries[idx];
                              if (sel) {
                                setCountryCode(sel.code);
                                setCountryFlag(sel.flag || '');
                                setCountryDropdownOpen(false);
                                setCountrySearch('');
                                setHighlightCountryIndex(-1);
                              }
                            } else if (e.key === 'Escape') {
                              setCountryDropdownOpen(false);
                              setCountrySearch('');
                            }
                          }}
                          placeholder="Search country or code"
                          className="w-full rounded-md bg-black/20 border border-slate-800 px-2 py-1 text-xs placeholder:text-slate-500"
                        />
                      </div>
                      {filteredCountries.map((c, idx) => (
                          <button
                            key={c.code + c.label}
                            type="button"
                            role="option"
                            aria-selected={highlightCountryIndex === idx}
                            onMouseEnter={() => setHighlightCountryIndex(idx)}
                            onMouseLeave={() => setHighlightCountryIndex(-1)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-3 ${highlightCountryIndex === idx ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
                            onMouseDown={(e) => { e.preventDefault(); setCountryCode(c.code); setCountryFlag(c.flag || ''); setCountryDropdownOpen(false); setCountrySearch(''); setHighlightCountryIndex(-1); }}
                          >
                            <span className="h-6 w-6 rounded-full overflow-hidden flex items-center justify-center bg-white/5 text-sm ring-1 ring-white/5">{c.flag}</span>
                            <span className="font-semibold mr-2">{c.code}</span>
                            <span className="text-slate-400">
                              {(() => {
                                const q = countrySearch.trim();
                                if (!q) return c.label;
                                const li = c.label.toLowerCase();
                                const qi = q.toLowerCase();
                                const idxMatch = li.indexOf(qi);
                                if (idxMatch === -1) return c.label;
                                const before = c.label.slice(0, idxMatch);
                                const match = c.label.slice(idxMatch, idxMatch + qi.length);
                                const after = c.label.slice(idxMatch + qi.length);
                                return (<>{before}<span className="text-emerald-300">{match}</span>{after}</>);
                              })()}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <input
                  id="auth-phone"
                  value={phone}
                  onChange={(e) => handlePhoneInputChange(e.target.value)}
                  onPaste={(e) => {
                    try {
                      const p = (e.clipboardData || (window as any).clipboardData).getData('text');
                      if (p && p.trim().startsWith('+')) {
                        e.preventDefault();
                        handlePhoneInputChange(p.trim());
                        return;
                      }
                    } catch {}
                  }}
                  onFocus={() => { if (phone.trim().startsWith('+')) { setCountrySearch(phone.trim().match(/^\+?[0-9\-]+/)?.[0] || ''); setCountryDropdownOpen(true); setPhone(''); } }}
                  inputMode="tel"
                  placeholder="Phone number"
                  className={`flex-1 ${inputClass}`}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="auth-password" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Password</label>
            <div className="relative w-full">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                minLength={8}
                aria-describedby="password-help"
                className={prominentInputClass}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 h-8 w-8 flex items-center justify-center bg-transparent border-0"
              >
                <i className={showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'} />
              </button>
            </div>
            <p id="password-help" className="text-[11px] text-slate-500">Minimum 8 characters.</p>
          </div>

          {mode === 'SIGNUP' && (
            <div className="space-y-1">
              <label htmlFor="auth-confirm" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Confirm password</label>
                <input id="auth-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" minLength={8} className={inputClass} />
            </div>
          )}

              {mode === 'SIGNUP' && (
                <div className="space-y-1 relative">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Referral (optional)</label>
                  <div className="w-full">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setReferralDropdownOpen(prev => !prev)}
                      onBlur={() => setTimeout(() => setReferralDropdownOpen(false), 150)}
                      className="w-full h-10 rounded-lg bg-black/20 border border-slate-800 px-3 text-xs text-slate-400 flex items-center justify-between cursor-pointer"
                    >
                      <span>{referralMode === 'NONE' ? 'Skip' : (referral || 'Enter Code')}</span>
                      <i className="fa-solid fa-chevron-down text-[11px] text-slate-400"></i>
                    </div>
                    {referralDropdownOpen && (
                      <div className="absolute mt-1 left-0 w-full bg-[#0b0d0f] border border-slate-800 rounded-md shadow-lg z-20">
                        <button type="button" className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800" onMouseDown={(e) => { e.preventDefault(); setReferralMode('EDIT'); setReferralDropdownOpen(false); }}>
                          Enter Code
                        </button>
                        <button type="button" className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800" onMouseDown={(e) => { e.preventDefault(); setReferralMode('NONE'); setReferral(''); setReferralDropdownOpen(false); }}>
                          Skip
                        </button>
                      </div>
                    )}
                    {referralMode === 'EDIT' && (
                      <input id="auth-referral" value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="Enter code (optional)" className={`mt-2 ${inputClass}`} />
                    )}
                  </div>
                </div>
              )}

          {mode === 'SIGNUP' && (
            <div className="space-y-1 sm:col-span-1">
              <label htmlFor="auth-gender" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Gender</label>
              <select id="auth-gender" value={gender} onChange={(e) => setGender(e.target.value as any)} className={`${inputClass} appearance-none`}>
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          {mode === 'LOGIN' ? (
            <>
              <label className="inline-flex items-center space-x-2 text-slate-300"><input id="auth-remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-emerald-400 rounded-sm" /><span>Remember me</span></label>
              <a href="/forgot-password" className="text-emerald-300">Forgot password?</a>
            </>
          ) : (
            <div className="text-[11px] text-slate-400">You can complete KYC later from your profile — access to trading may require verification.</div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black text-sm font-extrabold uppercase shadow-lg hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-60 disabled:pointer-events-none">
          {mode === 'LOGIN' ? 'Sign in' : 'Sign up'}
        </button>

        {mode === 'SIGNUP' && (
          <div className="flex items-start gap-3 text-xs text-slate-400">
            <label className="inline-flex items-center space-x-2"><input id="auth-accept" type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="h-4 w-4 accent-emerald-400 mt-1 rounded-sm" /><span>I agree to the <a href="/terms" className="text-emerald-300 underline">Terms & Conditions</a></span></label>
          </div>
        )}

        <p className="text-[11px] text-slate-500 text-center mt-1">Need help? Contact support after signup to speed up verification.</p>
      </form>
    </div>
  );

  const header = (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl w-full">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/40">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.siteName} className="h-6 w-6 object-contain rounded" />
            ) : (
              <span className="text-lg font-black text-slate-950">{config.logoText}</span>
            )}
          </div>
          <div className="flex-col text-xs font-semibold text-slate-300">
            <span className="text-sm font-black tracking-tight text-white">{config.siteName}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <button
            className="hidden sm:inline-flex rounded-full border border-slate-500/60 px-4 py-1.5 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300 transition-colors"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          >
            Home
          </button>
          <button
            className={`rounded-full border border-slate-500/60 px-4 py-1.5 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300 transition-colors ${mode === 'LOGIN' ? 'bg-emerald-500 text-black border-emerald-400' : ''}`}
            onClick={() => setMode('LOGIN')}
          >
            Log in
          </button>
          <button
            className={`rounded-full bg-emerald-500 px-4 py-1.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition-transform hover:-translate-y-0.5 ${mode === 'SIGNUP' ? 'ring-2 ring-emerald-400' : ''}`}
            onClick={() => setMode('SIGNUP')}
          >
            Sign up
          </button>
          <button className="inline-flex items-center space-x-1 rounded-full border border-slate-600/70 bg-slate-900/60 px-3 py-1.5 font-semibold text-slate-200 text-[11px]">
            <span>EN</span>
            <i className="fa-solid fa-chevron-down text-[9px]" />
          </button>
        </div>
      </div>
    </header>
  );

  if (embedded) return formContent;

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#020617] text-white">
      {header}
      <div className="flex-1 flex items-center justify-center px-4">
        {formContent}
      </div>
    </div>
  );
};

export default UserAuthScreen;
