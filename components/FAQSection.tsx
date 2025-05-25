"use client";
import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

// Define the FAQ type
interface FAQ {
  id: string | number;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
}

export default function FAQSection({
  faqs = [],
  title = "Часто задаваемые вопросы",
}: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<string | number>>(new Set());

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleItem = (id: string | number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="py-8 md:py-12 px-4 md:px-6 lg:px-8 bg-[#1d1a2d]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mb-6 md:mb-8 px-2">
          {title}
        </h2>
        <div className="space-y-2 md:space-y-3">
          {faqs.map((faq) => {
            const isOpen = openItems.has(faq.id);

            return (
              <div
                key={faq.id}
                className="bg-[#141220] rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[rgba(154,24,64,0.3)]"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-left transition-colors duration-300  group"
                >
                  <span className="text-sm md:text-base lg:text-lg text-white font-medium pr-3 md:pr-4 leading-relaxed">
                    {faq.question}
                  </span>
                  <IoChevronDown
                    className={`w-4 h-4 md:w-5 md:h-5 text-[#9a1840] transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-[500px]" : "max-h-0"
                  }`}
                >
                  <div className="px-4 md:px-6 pb-3 md:pb-4 pt-0">
                    <p className="text-xs md:text-sm lg:text-base text-[rgba(255,255,255,0.7)] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
