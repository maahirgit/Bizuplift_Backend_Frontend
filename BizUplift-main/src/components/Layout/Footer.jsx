
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-secondary text-white pt-16 pb-8 mt-auto">
            <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                {/* Brand */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold font-heading text-primary-light">BizUplift</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Empowering small sellers and celebrating culture through a modern marketplace experience.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-primary translation">About Us</a></li>
                        <li><a href="#" className="hover:text-primary translation">Careers</a></li>
                        <li><a href="#" className="hover:text-primary translation">Press</a></li>
                        <li><a href="#" className="hover:text-primary translation">Contact</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="font-heading text-lg font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-primary translation">Help Center</a></li>
                        <li><a href="#" className="hover:text-primary translation">Seller Guide</a></li>
                        <li><a href="#" className="hover:text-primary translation">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-primary translation">Privacy Policy</a></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-heading text-lg font-semibold mb-4">Stay Connected</h4>
                    <div className="flex gap-4 mb-6">
                        <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-primary transition"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-primary transition"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-primary transition"><Instagram className="w-5 h-5" /></a>
                    </div>
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm text-white focus:outline-none focus:border-primary"
                        />
                        <button className="absolute right-1 top-1 bg-primary text-white p-1.5 rounded-full hover:bg-primary-light transition">
                            <Mail className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="container border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} BizUplift. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
