import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SOCIAL } from '../constants/social';

export default function FloatingWhatsApp() {
  return (
    <motion.a
      href={SOCIAL.whatsapp}
      target="_blank"
      rel="noreferrer"
      className="floating-wa"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} color="white" strokeWidth={2.5} />
    </motion.a>
  );
}
