import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Phone, MapPin, User, Loader } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const ChatModal = ({ isOpen, onClose, booking }) => {
    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && booking) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll for new messages
            return () => clearInterval(interval);
        }
    }, [isOpen, booking]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/api/messages/${booking.id}`);
            setMessages(response.data);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await api.post('/api/messages', {
                bookingId: booking.id,
                content: newMessage
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (err) {
            alert('Failed to send message');
        }
    };

    if (!isOpen) return null;

    const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
    const peer = currentUser.role === 'FARMER' ? booking.equipment?.owner : booking.farmer;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-primary-600 text-white">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">{peer?.fullName || 'Contact'}</h3>
                                <p className="text-xs text-white/80 capitalize">{peer?.role?.toLowerCase() || ''}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Contact Info (Only if Confirmed) */}
                    {isConfirmed ? (
                        <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone size={16} className="text-primary-600" />
                                <span>{peer?.phoneNumber || 'N/A'}</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-700">
                                <MapPin size={16} className="text-primary-600 mt-0.5" />
                                <span>{peer?.address ? `${peer.address}, ${peer.city}, ${peer.state} - ${peer.pincode}` : 'Address not provided'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-orange-50 text-orange-700 text-sm flex items-center gap-2 italic">
                            Contact information will be visible once the booking is confirmed.
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {loading ? (
                            <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-primary-600" /></div>
                        ) : messages.length > 0 ? (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.sender.id === currentUser.id
                                                ? 'bg-primary-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-800 rounded-tl-none'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${msg.sender.id === currentUser.id ? 'text-white/70' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 mt-10 italic">No messages yet. Start the conversation!</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChatModal;
