import { motion } from 'framer-motion';
import { Target, Users, ShieldCheck, Heart, Tractor, Globe, Sprout, Award } from 'lucide-react';

const AboutPage = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const values = [
        { icon: <Target className="text-blue-500" />, title: "Precision", desc: "Providing the right machinery for the specific needs of every crop and soil." },
        { icon: <Users className="text-purple-500" />, title: "Community", desc: "Building a supportive network where equipment owners and farmers thrive together." },
        { icon: <ShieldCheck className="text-green-500" />, title: "Trust", desc: "Ensuring secure transactions and verified equipment for peace of mind." },
        { icon: <Heart className="text-red-500" />, title: "Empowerment", desc: "Helping small-scale farmers access technology that was once out of reach." }
    ];

    const stats = [
        { value: "50k+", label: "Farmers Empowered" },
        { value: "10k+", label: "Machines Listed" },
        { value: "15+", label: "States Covered" },
        { value: "4.8/5", label: "Happy Users" }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900 text-white">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Farming Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.h1
                        {...fadeIn}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
                    >
                        Cultivating a <span className="text-primary-500">Shared Future</span>
                    </motion.h1>
                    <motion.p
                        {...fadeIn}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-300 font-medium leading-relaxed"
                    >
                        AgroLease is more than a rental platform—it's a movement to modernize
                        agriculture through technology and community-driven machinery sharing.
                    </motion.p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div {...fadeIn}>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Seeds of Innovation</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed font-medium text-lg">
                            <p>
                                Founded in 2024, AgroLease (Krushak) emerged from a simple observation:
                                most small-scale farmers lack the capital to buy high-end machinery
                                like harvesters and high-power tractors, while existing owners
                                have equipment sitting idle for months.
                            </p>
                            <p>
                                We decided to bridge this gap. By creating a seamless, transparent
                                marketplace, we've enabled farmers to hire state-of-the-art equipment
                                on-demand, significantly reducing their production costs and
                                increasing yields.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex grid grid-cols-2 gap-6"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center p-6 glass-effect bg-white/50 rounded-2xl shadow-sm border border-white">
                                <p className="text-3xl font-black text-primary-600 mb-1">{stat.value}</p>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-gray-50 px-4">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">Our Core Values</h2>
                    <p className="text-gray-500 font-medium">The principles that drive every decision at Krushak</p>
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    {values.map((v, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                        >
                            <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {v.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 px-4 overflow-hidden">
                <div className="max-w-5xl mx-auto bg-primary-600 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-10">
                        <Tractor size={400} />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="relative z-10"
                    >
                        <Sprout className="mx-auto mb-8 h-16 w-16 text-primary-200" />
                        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                            Mission: To make high-tech farming <br />
                            <span className="text-primary-200">accessible to every Indian.</span>
                        </h2>
                        <button className="bg-white text-primary-700 font-black px-10 py-4 rounded-full hover:bg-gray-100 transition shadow-xl uppercase tracking-widest text-sm">
                            Join the Revolution
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
