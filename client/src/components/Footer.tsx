const Footer: React.FC = () => (
  <footer className="w-full bg-blue-950 text-white py-4 px-6 mt-auto">
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
      <span>© 2026 LearnHub. All rights reserved.</span>
      <span className="hidden sm:block text-white/40">|</span>
      <a href="mailto:learnhub@gmail.com" className="hover:text-blue-200 transition-colors">
        learnhub@gmail.com
      </a>
    </div>
  </footer>
);

export default Footer;
