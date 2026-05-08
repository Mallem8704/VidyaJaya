import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const metrics = [
  { value: 50000, suffix: '+', label: 'Active Students', icon: '👥' },
  { value: 12, suffix: '+', label: 'AI Tools', icon: '🤖' },
  { value: 100000, suffix: '+', label: 'Mock Tests Completed', icon: '📝' },
  { value: 500, suffix: '+', label: 'Campus Ambassadors', icon: '🎓' },
  { value: 95, suffix: '%', label: 'Success Rate', icon: '🏆' },
];

function AnimatedCounter({ target, suffix, duration = 2000 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  const format = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    return n.toString();
  };

  return <span ref={ref}>{format(count)}{suffix}</span>;
}

export default function TrustSection() {
  return (
    <section className="trust-section-f" id="trust">
      <div className="container-f">
        <motion.div
          className="trust-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              className="trust-card-f"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
            >
              <div className="trust-icon-f">{m.icon}</div>
              <div className="trust-val-f">
                <AnimatedCounter target={m.value} suffix={m.suffix} />
              </div>
              <div className="trust-lbl-f">{m.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
