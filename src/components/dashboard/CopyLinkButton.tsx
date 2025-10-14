'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="btn bg-white/20 hover:bg-white/30 text-white border-none flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          הועתק!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          העתק
        </>
      )}
    </button>
  );
}

