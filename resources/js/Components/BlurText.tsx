import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface BlurTextProps {
    text: string;
    className?: string;
    /** An exact word to render in the accent colour (used for the hero accent). */
    highlightWord?: string;
    /** Initial stagger delay (seconds) before the first word animates. */
    delay?: number;
    align?: 'center' | 'start';
}

/**
 * Word-by-word blur-in headline. Each word starts blurred (10px), offset 50px
 * down and invisible; once the block enters the viewport (IntersectionObserver
 * at a 0.1 threshold) the words fade up with a 100ms stagger. Reduced-motion
 * users get the fully readable headline immediately.
 */
export default function BlurText({
    text,
    className = '',
    highlightWord,
    delay = 0,
    align = 'center',
}: BlurTextProps) {
    const rootRef = useRef<HTMLSpanElement>(null);
    const [inView, setInView] = useState(false);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    const words = text.split(' ');
    const wrap = `inline-flex flex-wrap gap-x-[0.28em] gap-y-[0.1em] ${align === 'start' ? 'justify-start' : 'justify-center'}`;

    if (reduceMotion) {
        return (
            <span ref={rootRef} className={`${wrap} ${className}`}>
                {words.map((word, i) => (
                    <span key={`${word}-${i}`} className={word === highlightWord ? 'text-accent' : undefined}>
                        {word}
                    </span>
                ))}
            </span>
        );
    }

    return (
        <span ref={rootRef} className={`${wrap} ${className}`}>
            {words.map((word, i) => (
                <motion.span
                    key={`${word}-${i}`}
                    className="inline-block"
                    initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
                    animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : undefined}
                    transition={{ duration: 0.7, delay: delay + i * 0.1, ease: 'easeOut' }}
                >
                    {word === highlightWord ? <span className="text-accent">{word}</span> : word}
                </motion.span>
            ))}
        </span>
    );
}
