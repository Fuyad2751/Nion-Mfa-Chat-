import { Link } from 'react-router-dom';

const GuidePage = () => {
  const steps = [
    {
      step: '০১',
      title: 'অ্যাকাউন্ট তৈরি',
      icon: '📝',
      description: 'প্রথমে "রেজিস্টার করো" বাটনে ক্লিক করে তোমার নাম, ইমেইল ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট তৈরি করো। পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
    },
    {
      step: '০২',
      title: 'লগইন করো',
      icon: '🔐',
      description: 'অ্যাকাউন্ট তৈরি হয়ে গেলে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করো। লগইন সফল হলে তুমি চ্যাট পেজে চলে যাবে।',
    },
    {
      step: '০৩',
      title: 'বন্ধু সার্চ ও অ্যাড',
      icon: '🔍',
      description: 'সাইডবারের উপরে 🔍 আইকনে ক্লিক করে বন্ধুর নাম বা ইমেইল লিখে সার্চ করো। সার্চ রেজাল্ট থেকে "+ অ্যাড" বাটনে ক্লিক করে ফ্রেন্ড রিকোয়েস্ট পাঠাও।',
    },
    {
      step: '০৪',
      title: 'ফ্রেন্ড রিকোয়েস্ট অ্যাকসেপ্ট',
      icon: '✅',
      description: 'কেউ ফ্রেন্ড রিকোয়েস্ট পাঠালে সাইডবারে 🔔 নোটিফিকেশন আসবে। সেখানে ক্লিক করে "অ্যাকসেপ্ট" বাটনে ক্লিক করে বন্ধু বানিয়ে ফেলো।',
    },
    {
      step: '০৫',
      title: 'চ্যাটিং শুরু করো',
      icon: '💬',
      description: 'বন্ধু অ্যাকসেপ্ট হলে ফ্রেন্ড লিস্টে তার নাম দেখা যাবে। নামে ক্লিক করলেই চ্যাট উইন্ডো খুলবে। মেসেজ লিখে "পাঠাও" বাটনে ক্লিক করলেই রিয়েল-টাইমে মেসেজ চলে যাবে।',
    },
    {
      step: '০৬',
      title: 'ইমোজি পাঠানো',
      icon: '😊',
      description: 'মেসেজ ইনপুটের পাশে 😊 বাটনে ক্লিক করলে ইমোজি পিকার খুলবে। পছন্দের ইমোজি সিলেক্ট করে মেসেজে যোগ করতে পারবে।',
    },
    {
      step: '০৭',
      title: 'মেসেজে রিয়েক্ট',
      icon: '❤️',
      description: 'কোনো মেসেজের উপর হোভার করলে ❤️ বাটন দেখা যাবে। ক্লিক করলে মেসেজে হার্ট রিয়েক্ট যোগ হবে।',
    },
    {
      step: '০৮',
      title: 'গ্রুপ তৈরি',
      icon: '👥',
      description: 'সাইডবারে "গ্রুপ" ট্যাবে যাও → "+ নতুন" বাটনে ক্লিক করো → গ্রুপের নাম দাও → বন্ধু সিলেক্ট করো → "গ্রুপ তৈরি করো" বাটনে ক্লিক করো।',
    },
    {
      step: '০৯',
      title: 'গ্রুপ চ্যাটিং',
      icon: '👨‍👩‍👧‍👦',
      description: 'গ্রুপ তৈরি হলে গ্রুপ লিস্টে নাম দেখা যাবে। ক্লিক করলেই গ্রুপ চ্যাট খুলবে — এখানে সবাই একসাথে চ্যাট করতে পারবে।',
    },
    {
      step: '१०',
      title: 'প্রোফাইল আপডেট',
      icon: '👤',
      description: 'সাইডবারের উপরে 👤 আইকনে ক্লিক করে প্রোফাইল পেজে যাও। সেখানে নাম পরিবর্তন ও প্রোফাইল ছবি আপলোড করতে পারবে।',
    },
    {
      step: '११',
      title: 'বন্ধু ডিলিট',
      icon: '🗑️',
      description: 'ফ্রেন্ড লিস্টে বন্ধুর নামের ডান পাশে 🗑️ আইকন দেখা যাবে। ক্লিক করে কনফার্ম করলেই বন্ধু ডিলিট হবে।',
    },
    {
      step: '१२',
      title: 'লগআউট',
      icon: '🚪',
      description: 'সাইডবারের উপরে 🚪 আইকনে ক্লিক করে লগআউট করতে পারবে।',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* হেডার */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#00F0FF] mb-3"
            style={{ textShadow: '0 0 15px #00F0FF, 0 0 40px #00F0FF, 0 0 80px #00F0FF' }}>
            ব্যবহার নির্দেশিকা
          </h1>
          <p className="text-[#FF007F] text-lg"
            style={{ textShadow: '0 0 8px #FF007F, 0 0 20px #FF007F' }}>
            Mfa Chat কীভাবে ব্যবহার করবে
          </p>
          <p className="text-gray-500 text-sm mt-2">
            ধাপে ধাপে সম্পূর্ণ গাইড
          </p>
        </div>

        {/* স্টেপ তালিকা */}
        <div className="space-y-4">
          {steps.map((item, index) => (
            <div
              key={index}
              className="bg-[#0F0F15] border border-[#00F0FF]/10 rounded-2xl p-5 md:p-6
                         hover:border-[#00F0FF]/30 transition-all duration-300
                         hover:shadow-[0_0_15px_rgba(0,240,255,0.1)]"
            >
              <div className="flex items-start gap-4">
                {/* স্টেপ নাম্বার */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#00F0FF]/20 to-[#FF007F]/20 
                                border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] font-bold text-lg"
                  style={{ boxShadow: '0 0 10px rgba(0,240,255,0.2)' }}>
                  {item.step}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-200">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ফুটার */}
        <div className="text-center mt-12 pb-8">
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#00F0FF] to-[#FF007F] rounded-xl 
                       text-black font-bold text-lg hover:shadow-[0_0_20px_#00F0FF,0_0_40px_#FF007F] 
                       hover:scale-105 transition-all duration-300"
          >
            এখনই শুরু করো 🚀
          </Link>
          <p className="text-gray-600 text-sm mt-4">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link to="/login" className="text-[#00F0FF] hover:text-[#FF007F] transition-colors">
              লগইন করো
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;