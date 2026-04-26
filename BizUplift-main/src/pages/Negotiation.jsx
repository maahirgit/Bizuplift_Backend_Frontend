
import { useState, useEffect, useRef } from 'react';
import { Send, DollarSign, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/UI/Button'; // Assuming you have this
import Card from '../components/UI/Card';     // Assuming you have this

const Negotiation = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [messages, setMessages] = useState([
        { id: 1, sender: 'seller', text: 'Hello! I see you are interested in the Handpainted Diya Set. The listed price is ₹499. Does that work for you?', timestamp: '10:00 AM' }
    ]);
    const [offer, setOffer] = useState('');
    const [status, setStatus] = useState('active'); // active, accepted, rejected
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendOffer = () => {
        if (!offer) return;

        // Add user offer
        const userMsg = { id: messages.length + 1, sender: 'user', text: `I would like to offer ₹${offer}.`, isOffer: true, offerAmount: offer, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setOffer('');

        // Simulate seller response
        setTimeout(() => {
            let sellerMsg;
            if (parseInt(offer) >= 450) {
                sellerMsg = { id: messages.length + 2, sender: 'seller', text: `That's a fair price! I accept your offer of ₹${offer}.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                setStatus('accepted');
            } else if (parseInt(offer) < 300) {
                sellerMsg = { id: messages.length + 2, sender: 'seller', text: `Sorry, that's too low. The lowest I can go is ₹450 given the hand-painting work involved.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            } else {
                sellerMsg = { id: messages.length + 2, sender: 'seller', text: `How about we meet halfway at ₹450?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            }
            setMessages(prev => [...prev, sellerMsg]);
        }, 1500);
    };

    return (
        <div className="container py-6 max-w-2xl mx-auto h-[calc(100vh-80px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        {/* Placeholder avatar */}
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">AC</div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Artisan Crafters</h3>
                        <p className="text-xs text-secondary flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
                        </p>
                    </div>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-xs text-gray-500">Negotiating for:</p>
                    <p className="text-sm font-semibold truncate max-w-[150px]">Handpainted Diya Set...</p>
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 overflow-hidden flex flex-col bg-[#F5F7FB]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="text-center text-xs text-gray-400 my-4">Today</div>

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-primary-light' : 'text-gray-400'}`}>{msg.timestamp}</p>
                            </div>
                        </div>
                    ))}

                    {status === 'accepted' && (
                        <div className="flex justify-center my-4">
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex flex-col items-center gap-2 shadow-sm animate-fade-in">
                                <div className="flex items-center gap-2 font-bold"><CheckCircle className="w-5 h-5" /> Deal Accepted!</div>
                                <p className="text-sm">You agreed on ₹{messages[messages.length - 1].text.match(/₹(\d+)/)[1]}.</p>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 mt-1">Proceed to Checkout</Button>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {status !== 'accepted' && (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <span className="font-bold">₹</span>
                                </div>
                                <input
                                    type="number"
                                    placeholder="Enter your offer..."
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                    value={offer}
                                    onChange={(e) => setOffer(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendOffer()}
                                />
                            </div>
                            <Button onClick={handleSendOffer} disabled={!offer}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    {status === 'accepted' && (
                        <div className="text-center text-sm text-gray-500">
                            This negotiation has concluded.
                        </div>
                    )}
                </div>
            </Card>

            {/* Quick Suggestions - Optional */}
            {status === 'active' && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setOffer('400')} className="whitespace-nowrap px-3 py-1 bg-white border border-gray-200 rounded-full text-xs hover:border-primary hover:text-primary transition">₹400</button>
                    <button onClick={() => setOffer('420')} className="whitespace-nowrap px-3 py-1 bg-white border border-gray-200 rounded-full text-xs hover:border-primary hover:text-primary transition">₹420</button>
                    <button onClick={() => setOffer('450')} className="whitespace-nowrap px-3 py-1 bg-white border border-gray-200 rounded-full text-xs hover:border-primary hover:text-primary transition">₹450</button>
                </div>
            )}
        </div>
    );
};

export default Negotiation;
