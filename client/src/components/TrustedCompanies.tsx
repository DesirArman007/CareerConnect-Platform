import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Authentic Brand SVGs & Logos ─────────────────────────────────── */

const AmazonLogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <span className="font-bold text-[19px] sm:text-[22px] tracking-tight lowercase text-white">amazon</span>
  </div>
);

const NvidiaLogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <span className="font-black text-[18px] sm:text-[21px] tracking-wider text-white">NVIDIA</span>
  </div>
);

const AdobeLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M14.5 3H21V21L14.5 3ZM9.5 3H3V21L9.5 3ZM12 11.5L16.2 21H12.8L11.5 17.8H8.8L12 11.5Z" />
    </svg>
    <span className="font-bold text-[17px] sm:text-[19px] tracking-tight text-white">Adobe</span>
  </div>
);

const RevolutLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.5 3H6v18h3.5v-6h2.5l3.5 6H20l-4-6.5c2-1 3.5-3 3.5-5.5C19.5 5.5 17.5 3 14.5 3zm0 9H9.5V6h5c1.7 0 3 1.3 3 3s-1.3 3-3 3z" />
    </svg>
    <span className="font-bold text-[17px] sm:text-[19px] tracking-tight text-white">Revolut</span>
  </div>
);

const SupabaseLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="#3ECF8E">
      <path d="M13.7 21.8c-.4.5-1.3.2-1.3-.5V13h8.2c.9 0 1.3 1 .8 1.6L13.7 21.8z" />
      <path d="M10.3 2.2c.4-.5 1.3-.2 1.3.5V11H3.4c-.9 0-1.3-1-.8-1.6L10.3 2.2z" opacity=".7" />
    </svg>
    <span className="font-semibold text-[17px] sm:text-[19px] tracking-tight lowercase text-white">supabase</span>
  </div>
);

const RedditLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FF4500" />
      <circle cx="9" cy="12" r="1.3" fill="white" />
      <circle cx="15" cy="12" r="1.3" fill="white" />
      <path d="M9.5 15.2c.8.6 1.7.9 2.5.9s1.7-.3 2.5-.9" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="17.5" cy="7.5" r="1.5" fill="white" />
      <path d="M12 8.5l1.5-2.5 3.5 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
    <span className="font-bold text-[17px] sm:text-[19px] tracking-tight text-white">reddit</span>
  </div>
);

const ServiceNowLogo: React.FC = () => (
  <div className="flex items-center text-white select-none">
    <span className="font-semibold text-[17px] sm:text-[19px] tracking-tight lowercase text-white">servicenow</span>
    <span className="text-[#30be71] font-extrabold text-[22px] sm:text-[24px] leading-none ml-0.5">.</span>
  </div>
);

const HPLogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <span className="font-bold text-[20px] sm:text-[23px] tracking-widest uppercase text-white">HP</span>
  </div>
);

const CoinbaseLogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <span className="font-semibold text-[18px] sm:text-[21px] tracking-[-0.02em] lowercase text-white">coinbase</span>
  </div>
);

const SalesforceLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-7 h-6 sm:w-8 sm:h-7 flex-shrink-0" viewBox="0 0 24 24" fill="#00A1E0">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
    </svg>
    <span className="font-bold text-[16px] sm:text-[18px] tracking-tight text-white">salesforce</span>
  </div>
);

const SamsungLogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <span className="font-black text-[16px] sm:text-[18px] tracking-[0.18em] uppercase text-white font-sans">SAMSUNG</span>
  </div>
);

const BoeingLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      <path d="M3 14c4-3 10-6 18-2M5 10c3 2 9 5 15 2" strokeWidth="1.2" />
    </svg>
    <span className="font-black italic text-[16px] sm:text-[18px] tracking-[0.08em] uppercase text-white">BOEING</span>
  </div>
);

const CrowdStrikeLogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <span className="font-bold text-[14px] sm:text-[16px] tracking-[0.14em] uppercase text-white">CROWDSTRIKE</span>
  </div>
);

const PinterestLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="#E60023">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.2-2.4.04-3.44.22-.94 1.4-5.94 1.4-5.94s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.51.77 1.51 1.69 0 1.03-.66 2.56-1 3.98-.28 1.2.6 2.17 1.78 2.17 2.14 0 3.78-2.26 3.78-5.5 0-2.88-2.07-4.89-5.02-4.89-3.42 0-5.43 2.57-5.43 5.21 0 1.03.4 2.14.9 2.75.1.12.11.22.08.34-.09.38-.3 1.22-.39 1.62-.05.19-.16.24-.36.15-1.34-.62-2.18-2.58-2.18-4.15 0-3.38 2.46-6.49 7.09-6.49 3.72 0 6.62 2.65 6.62 6.2 0 3.7-2.33 6.68-5.57 6.68-1.09 0-2.11-.57-2.46-1.24l-.67 2.56c-.24.93-.9 2.09-1.34 2.8 1.01.31 2.08.48 3.19.48 6.63 0 12-5.37 12-12S18.63 0 12 0z" />
    </svg>
    <span className="font-semibold text-[17px] sm:text-[19px] tracking-tight text-white">Pinterest</span>
  </div>
);

const RubrikLogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <span className="font-bold text-[19px] sm:text-[22px] tracking-tight lowercase text-white">rubrik</span>
  </div>
);

const OktaLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#007DC1" strokeWidth="4">
      <circle cx="12" cy="12" r="8" />
    </svg>
    <span className="font-bold text-[17px] sm:text-[19px] tracking-tight lowercase text-white">okta</span>
  </div>
);

const AirbnbLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" viewBox="0 0 24 24" fill="#FF5A5F">
      <path d="M12.001 18.275c-.928-1.14-1.777-2.318-2.441-3.497-.773-1.39-1.217-2.669-1.217-3.72 0-1.876 1.507-3.397 3.388-3.397s3.388 1.52 3.388 3.397c0 1.051-.444 2.33-1.217 3.72-.664 1.18-1.513 2.357-2.441 3.497h.54zm0 2.503c4.66-5.186 6.888-8.907 6.888-11.721C18.889 5.367 15.8 2.222 12 2.222S5.112 5.367 5.112 9.057c0 2.814 2.228 6.535 6.888 11.721h.001z" />
    </svg>
    <span className="font-bold text-[17px] sm:text-[19px] tracking-tight lowercase text-white">airbnb</span>
  </div>
);

const TwilioLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="#F22F46">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="8" r="1.8" fill="white" />
      <circle cx="16" cy="8" r="1.8" fill="white" />
      <circle cx="8" cy="16" r="1.8" fill="white" />
      <circle cx="16" cy="16" r="1.8" fill="white" />
    </svg>
    <span className="font-bold text-[17px] sm:text-[19px] tracking-tight lowercase text-white">twilio</span>
  </div>
);

const StripeLogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <svg className="h-[22px] sm:h-[26px] w-auto text-white" viewBox="0 0 60 25" fill="currentColor">
      <path d="M59.64 14.28c0-4.47-2.18-8.01-6.42-8.01-4.27 0-6.84 3.54-6.84 7.96 0 5.25 3.09 7.9 7.42 7.9 2.11 0 3.7-.47 4.9-1.12v-3.41c-1.2.6-2.58.94-4.1.94-1.63 0-3.07-.63-3.26-2.48h8.25c.02-.37.05-1.27.05-1.78zm-8.38-1.57c0-1.7 1.03-2.44 2.15-2.44 1.08 0 2.08.74 2.08 2.44h-4.23zM37.8 6.27h4.86v15.56H37.8V6.27zm0-5.46h4.86v3.91H37.8V.81zm-6.2 8.35c-.65-.41-1.63-.78-2.67-.78-2.06 0-3.32 1.06-3.32 2.66 0 3.05 4.19 2.56 4.19 5.48 0 .99-.8 1.63-2.02 1.63-1.38 0-2.8-.62-3.83-1.4l-.87 3.39c1.03.69 2.82 1.22 4.7 1.22 3.09 0 5.23-1.53 5.23-4.04 0-3.37-4.21-2.73-4.21-5.44 0-.85.67-1.47 1.76-1.47 1.08 0 2.23.44 3.03.94l.01-2.19zm-13.88.58l-.34-1.47H13.6v13.37h4.88v-9.4c1.15-1.51 3.1-1.24 3.73-1.01l.9-4.43c-.7-.27-2.7-.63-4.39 1.51v-.47zm-9.87-.58h-4.8v11.19c0 2.75 2.06 4.39 4.8 4.39 1.51 0 2.63-.28 3.26-.64v-3.37c-.57.23-3.26 1-3.26-1.38v-6.3h3.26V9.16H7.85V5.59L2.98 6.74v2.42H0v3.89h2.98v8.78H7.85V9.16z" />
    </svg>
  </div>
);

const NotionLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.1 2.093c-.42-.326-.98-.7-2.055-.607L3.01 2.7c-.467.047-.56.28-.374.466l1.823 1.042zm.793 3.358v13.905c0 .746.373 1.026 1.213.98l14.523-.84c.84-.046.933-.56.933-1.166V6.58c0-.607-.233-.933-.746-.886l-15.177.886c-.56.047-.746.327-.746.886zm14.337.42c.093.42 0 .84-.42.886l-.7.14v10.264c-.607.327-1.166.514-1.633.514-.746 0-.933-.234-1.493-.933l-4.572-7.186v6.953l1.446.327s0 .84-1.166.84l-3.218.186c-.093-.186 0-.653.327-.746l.84-.233V8.87l-1.166-.093c-.093-.42.14-1.026.793-1.073l3.452-.233 4.758 7.28v-6.44l-1.213-.14c-.093-.514.28-.886.746-.933l3.358-.186z" />
    </svg>
    <span className="font-semibold text-[17px] sm:text-[19px] tracking-tight text-white">Notion</span>
  </div>
);

const TwitchLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="#9146FF">
      <path d="M2.149 0L.537 4.119v16.836h5.731V24h3.224l3.045-3.045h4.657l6.269-6.269V0H2.149zm19.164 13.612l-3.582 3.582H12l-3.045 3.045v-3.045H4.119V2.149h17.194v11.463zM16.463 5.731h-2.149v6.269h2.149V5.731zm-5.731 0H8.583v6.269h2.149V5.731z" />
    </svg>
    <span className="font-extrabold text-[17px] sm:text-[19px] tracking-[0.01em] lowercase text-white">twitch</span>
  </div>
);

const ZscalerLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#0072CE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16l-12 16h12" />
    </svg>
    <span className="font-bold text-[16px] sm:text-[18px] tracking-tight text-white">zscaler</span>
  </div>
);

const DellLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[2px] border-white flex items-center justify-center font-black text-[9px] tracking-tight flex-shrink-0">
      <span className="transform -rotate-12">DELL</span>
    </div>
    <span className="font-bold text-[16px] sm:text-[18px] tracking-wider text-white">DELL</span>
  </div>
);

const CloudflareLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-6 h-5 sm:w-7 sm:h-6 flex-shrink-0 text-[#F38020]" viewBox="0 0 24 16" fill="currentColor">
      <path d="M16.5 14.5l.7-2.5c.1-.2.1-.5.1-.7a.9.9 0 00-.3-.6c-.1-.2-.4-.3-.7-.3l-10.3 0c-.1 0-.2 0-.2-.1a.2.2 0 010-.2l.2-.8a.3.3 0 01.3-.3l10.6 0c1.2-.1 2.4-.9 2.9-2.1l.6-1.5c0-.1.1-.2.1-.3C20.5 2.5 17.8 0 14.4 0c-3 0-5.5 2-6.3 4.7a3.6 3.6 0 00-2.6-.4c-1.2.2-2.2 1.2-2.4 2.4a3.4 3.4 0 000 1.8A4.4 4.4 0 000 12.7c0 .5.1.9.2 1.4a.4.4 0 00.4.3l15.6 0c.2 0 .3-.1.3-.3v-.1l-.0 .5z" />
      <path d="M19.3 5.7l-.2 1.5c-.1.2-.1.5-.1.7a.9.9 0 00.3.6c.1.2.4.3.7.3l2.5 0c.1 0 .2 0 .2.1a.2.2 0 010 .2l-.2.8a.3.3 0 01-.3.3H19.4c-.2 0-.2.1-.2.1l-.2.8a.2.2 0 00.2.2h2.4a.4.4 0 00.4-.3A5.4 5.4 0 0022 9.5c0-1.7-.8-3.2-2-4.1l-.7.3z" />
    </svg>
    <span className="text-[14px] sm:text-[16px] font-black uppercase tracking-[0.14em] text-white">CLOUDFLARE</span>
  </div>
);

const OpenAILogo: React.FC = () => (
  <div className="flex items-center justify-center select-none">
    <span className="font-semibold text-[19px] sm:text-[22px] tracking-tight text-white">OpenAI</span>
  </div>
);

const AutodeskLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="#0696D7">
      <path d="M3 21l8.5-18h4L7 21H3zm9 0l6.5-13.8L21 21h-3.8l-1.5-3.3h-4.2L12 21z" />
    </svg>
    <span className="font-bold text-[14px] sm:text-[16px] tracking-[0.1em] uppercase text-white">AUTODESK</span>
  </div>
);

const LangChainLogo: React.FC = () => (
  <div className="flex items-center gap-1.5 text-white select-none">
    <span className="text-base sm:text-lg">🦜</span>
    <span className="font-bold text-[16px] sm:text-[18px] tracking-tight text-white">LangChain</span>
  </div>
);

const PostmanLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="#FF6C37">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l8-5-3 5 3 5-8-5z" fill="white" />
    </svg>
    <span className="font-bold text-[14px] sm:text-[16px] tracking-[0.12em] uppercase text-white">POSTMAN</span>
  </div>
);

const CohereLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <div className="flex -space-x-1 flex-shrink-0">
      <div className="w-3.5 h-3.5 rounded-full bg-[#D1E7DD]" />
      <div className="w-3.5 h-3.5 rounded-full bg-[#FF7759]" />
    </div>
    <span className="font-bold text-[17px] sm:text-[19px] tracking-tight lowercase text-white">cohere</span>
  </div>
);

const FigmaLogo: React.FC = () => (
  <div className="flex items-center gap-2 text-white select-none">
    <svg className="w-5 h-6 sm:w-6 sm:h-7 flex-shrink-0" viewBox="0 0 38 57" fill="none">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
      <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
    </svg>
    <span className="font-semibold text-[17px] sm:text-[19px] tracking-tight text-white">Figma</span>
  </div>
);

/* ─── Company Item Structure ────────────────────────────────────────── */

interface CompanyItem {
  id: string;
  name: string;
  search: string;
  render: React.FC;
}

/* 30 Companies arranged into 3 rotating 5x2 sets (10 per set) */
const sets: CompanyItem[][] = [
  // Set 1: amazon, nvdia, adobe, revolut, supabase, reddit, servicenow, hp, coinbase, salesforce
  [
    { id: 'amazon', name: 'Amazon', search: 'Amazon', render: AmazonLogo },
    { id: 'nvidia', name: 'NVIDIA', search: 'Nvidia', render: NvidiaLogo },
    { id: 'adobe', name: 'Adobe', search: 'Adobe', render: AdobeLogo },
    { id: 'revolut', name: 'Revolut', search: 'Revolut', render: RevolutLogo },
    { id: 'supabase', name: 'Supabase', search: 'Supabase', render: SupabaseLogo },
    { id: 'reddit', name: 'Reddit', search: 'Reddit', render: RedditLogo },
    { id: 'servicenow', name: 'ServiceNow', search: 'ServiceNow', render: ServiceNowLogo },
    { id: 'hp', name: 'HP', search: 'HP', render: HPLogo },
    { id: 'coinbase', name: 'Coinbase', search: 'Coinbase', render: CoinbaseLogo },
    { id: 'salesforce', name: 'Salesforce', search: 'Salesforce', render: SalesforceLogo },
  ],
  // Set 2: samsung, boeing, crowdstrike, pinterest, rubrik, okta, airbnb, twilio, stripe, notion
  [
    { id: 'samsung', name: 'Samsung', search: 'Samsung', render: SamsungLogo },
    { id: 'boeing', name: 'Boeing', search: 'Boeing', render: BoeingLogo },
    { id: 'crowdstrike', name: 'CrowdStrike', search: 'CrowdStrike', render: CrowdStrikeLogo },
    { id: 'pinterest', name: 'Pinterest', search: 'Pinterest', render: PinterestLogo },
    { id: 'rubrik', name: 'Rubrik', search: 'Rubrik', render: RubrikLogo },
    { id: 'okta', name: 'Okta', search: 'Okta', render: OktaLogo },
    { id: 'airbnb', name: 'Airbnb', search: 'Airbnb', render: AirbnbLogo },
    { id: 'twilio', name: 'Twilio', search: 'Twilio', render: TwilioLogo },
    { id: 'stripe', name: 'Stripe', search: 'Stripe', render: StripeLogo },
    { id: 'notion', name: 'Notion', search: 'Notion', render: NotionLogo },
  ],
  // Set 3: twitch, zscaler, dell, cloudflare, openai, autodesk, langchain, postman, cohere, figma
  [
    { id: 'twitch', name: 'Twitch', search: 'Twitch', render: TwitchLogo },
    { id: 'zscaler', name: 'Zscaler', search: 'Zscaler', render: ZscalerLogo },
    { id: 'dell', name: 'Dell', search: 'Dell', render: DellLogo },
    { id: 'cloudflare', name: 'Cloudflare', search: 'Cloudflare', render: CloudflareLogo },
    { id: 'openai', name: 'OpenAI', search: 'OpenAI', render: OpenAILogo },
    { id: 'autodesk', name: 'Autodesk', search: 'Autodesk', render: AutodeskLogo },
    { id: 'langchain', name: 'LangChain', search: 'LangChain', render: LangChainLogo },
    { id: 'postman', name: 'Postman', search: 'Postman', render: PostmanLogo },
    { id: 'cohere', name: 'Cohere', search: 'Cohere', render: CohereLogo },
    { id: 'figma', name: 'Figma', search: 'Figma', render: FigmaLogo },
  ],
];

export const TrustedCompanies: React.FC = () => {
  const navigate = useNavigate();
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSetIndex((prev) => (prev + 1) % sets.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const currentLogos = sets[currentSetIndex];

  return (
    <div className="w-full pt-16 sm:pt-20 pb-4">
      {/* Centered Heading and Subtitle */}
      <div className="text-center mb-10 sm:mb-14 select-none">
        <h2 className="text-md sm:text-lg md:text-[19px] font-bold text-gray-300 tracking-tight">
          JOBS FROM LEADING COMPANIES
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-normal">
          Discover openings sourced directly from company career pages.
        </p>
      </div>

      {/* 5x2 Grid with Aceternity UI Swap Animation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-8 sm:gap-x-12 gap-y-12 sm:gap-y-16 items-center justify-items-center">
          {currentLogos.map((logo, index) => {
            const LogoComponent = logo.render;
            return (
              <button
                key={index}
                type="button"
                onClick={() => navigate(`/explore?search=${encodeURIComponent(logo.search)}`)}
                title={`View ${logo.name} jobs`}
                aria-label={`View ${logo.name} jobs`}
                className="w-full flex items-center justify-center h-14 sm:h-16 relative cursor-pointer select-none overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 rounded-lg"
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`${currentSetIndex}-${logo.id}`}
                    initial={{ x: 28, opacity: 0, filter: 'blur(4px)' }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      filter: 'blur(0px)',
                      transition: {
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                        delay: (index % 5) * 0.045 + Math.floor(index / 5) * 0.06,
                      },
                    }}
                    exit={{
                      x: -28,
                      opacity: 0,
                      filter: 'blur(4px)',
                      transition: {
                        duration: 0.45,
                        ease: [0.16, 1, 0.3, 1],
                        delay: (index % 5) * 0.035 + Math.floor(index / 5) * 0.05,
                      },
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="w-full h-full flex items-center justify-center select-none will-change-transform"
                  >
                    <LogoComponent />
                  </motion.div>
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
