import { useState, useEffect } from 'react';
import { LanguageContext } from './useLanguage';

const translations = {
    en: {
        welcome: "Hello",
        home: "Home",
        about: "About",
        equipment: "Equipment",
        schemes: "Schemes",
        login: "Login",
        register: "Register",
        getStarted: "Get Started",
        profile: "My Profile",
        logout: "Logout",
        heroTitle: "Modern Farming Equipment Rental",
        heroSubtitle: "Connect with equipment owners, rent high-quality machinery, and maximize your yield. The smart choice for modern Indian farmers.",
        learnMore: "Learn More",
        browseEquipment: "Browse Equipment",
        findBestMachinery: "Find the best machinery for your farm near you.",
        searchPlaceholder: "Search by name or location...",
        allCategories: "All Categories",
        rentNow: "Rent Now",
        viewDetails: "View Details",
        totalEstimate: "Total Estimate",
        requestBooking: "Request Booking",
        noEquipmentFound: "No equipment found matching your criteria.",
        backToBrowse: "Back to Browse",
        noReviewsYet: "No reviews yet. Be the first to review!",
        postReview: "Post Review",
        reviews: "Reviews",
        yourRating: "Your Rating",
        shareExperience: "Share your experience with this equipment..."
    },
    hi: {
        welcome: "नमस्ते",
        home: "मुख्य पृष्ठ",
        about: "हमारे बारे में",
        equipment: "उपकरण",
        schemes: "योजनाएं",
        login: "लॉगिन",
        register: "पंजीकरण",
        getStarted: "शुरू करें",
        profile: "मेरी रूपरेखा",
        logout: "लॉगआउट",
        heroTitle: "आधुनिक खेती उपकरण किराया",
        heroSubtitle: "उपकरण मालिकों के साथ जुड़ें, उच्च गुणवत्ता वाली मशीनरी किराए पर लें और अपनी उपज अधिकतम करें। आधुनिक भारतीय किसानों के लिए स्मार्ट विकल्प।",
        learnMore: "अधिक जानें",
        browseEquipment: "उपकरण खोजें",
        findBestMachinery: "अपने पास के खेत के लिए सर्वोत्तम मशीनरी खोजें।",
        searchPlaceholder: "नाम या स्थान से खोजें...",
        allCategories: "सभी श्रेणियां",
        rentNow: "अभी किराए पर लें",
        viewDetails: "विवरण देखें",
        totalEstimate: "कुल अनुमान",
        requestBooking: "बुकिंग का अनुरोध करें",
        noEquipmentFound: "आपकी खोज के अनुसार कोई उपकरण नहीं मिला।",
        backToBrowse: "पीछे जाएं",
        noReviewsYet: "अभी तक कोई समीक्षा नहीं। समीक्षा करने वाले पहले व्यक्ति बनें!",
        postReview: "समीक्षा भेजें",
        reviews: "समीक्षाएँ",
        yourRating: "आपकी रेटिंग",
        shareExperience: "इस उपकरण के साथ अपने अनुभव साझा करें..."
    },
    mr: {
        welcome: "नमस्कार",
        home: "मुख्यपृष्ठ",
        about: "आमच्याबद्दल",
        equipment: "उपकरणे",
        schemes: "योजना",
        login: "लॉगिन",
        register: "नोंदणी",
        getStarted: "सुरू करा",
        profile: "माझे प्रोफाइल",
        logout: "लॉगआउट",
        heroTitle: "आधुनिक शेती उपकरणे भाड्याने",
        heroSubtitle: "उपकरण मालकांशी कनेक्ट व्हा, उच्च-गुणवत्तेची यंत्रसामग्री भाड्याने घ्या आणि आपले उत्पन्न वाढवा. आधुनिक भारतीय शेतकऱ्यांसाठी स्मार्ट निवड.",
        learnMore: "अधिक जाणून घ्या",
        browseEquipment: "उपकरणे पहा",
        findBestMachinery: "तुमच्या जवळच्या शेतासाठी सर्वोत्तम यंत्रसामग्री शोधा.",
        searchPlaceholder: "नाव किंवा ठिकाणावरून शोधा...",
        allCategories: "सर्व श्रेणी",
        rentNow: "आत्ता भाड्याने घ्या",
        viewDetails: "तपशील पहा",
        totalEstimate: "एकूण अंदाज",
        requestBooking: "बुकिंगची विनंती करा",
        noEquipmentFound: "तुमच्या निकषांशी जुळणारे कोणतेही उपकरण सापडले नाही.",
        backToBrowse: "मागे फिरा",
        noReviewsYet: "अजून एकही प्रतिक्रिया नाही. पहिली प्रतिक्रिया तुम्ही द्या!",
        postReview: "प्रतिक्रिया पाठवा",
        reviews: "प्रतिक्रिया",
        yourRating: "तुमची रेटिंग",
        shareExperience: "या उपकरणाचा तुमचा अनुभव शेअर करा..."
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => {
        if (!translations[language]) return key;
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};


