import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  defaultOpenId?: string;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenId,
  className,
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : [items[0]?.id]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('space-y-3.5', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden transition-all duration-200 shadow-sm hover:border-slate-300"
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full p-5 text-left flex items-center justify-between text-base font-semibold text-[#101B2D] hover:text-[#2563EB] transition-colors focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="pr-4">{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180 text-[#2563EB]'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
