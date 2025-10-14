import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  Settings, 
  Zap,
  CheckCircle,
  TrendingUp,
  Smartphone,
  Shield,
  Star,
  ArrowLeft,
  Scissors,
  Stethoscope,
  Sparkles,
  Activity,
  Scale,
  Car,
  MoreHorizontal,
  Apple,
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  Bell,
  CheckCheck
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="Clickinder"
              className="h-10"
            />
          </Link>
          <div className="flex gap-4">
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              התחברות
            </Link>
            <Link
              href="/auth/register"
              className="btn btn-primary"
            >
              הרשמה חינם
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          <span>30 יום ניסיון חינם - ללא כרטיס אשראי</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          נהל את התורים שלך<br />
          <span className="text-primary-600">בקלות ובמהירות</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          פלטפורמת תזמון תורים מתקדמת לעסקים בישראל. 
          חסוך זמן, הפחת טעויות והגדל את שביעות הרצון של הלקוחות שלך
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/auth/register"
            className="btn btn-primary text-lg px-10 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            התחל בחינם - 30 יום ללא התחייבות
            <ArrowLeft className="w-5 h-5 inline mr-2" />
          </Link>
          <a
            href="#features"
            className="btn btn-secondary text-lg px-10 py-4"
          >
            גלה את היכולות
          </a>
        </div>

        <p className="text-sm text-gray-500">
          ✓ ללא כרטיס אשראי  ✓ התקנה מיידית  ✓ ביטול בכל עת
        </p>

        {/* Mobile Apps */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-gray-600 font-medium">גם באפליקציה לנייד!</p>
          <div className="flex gap-4">
            <a
              href="#"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/he-il?size=250x83&releaseDate=1316044800"
                alt="הורד מ-App Store"
                className="h-12"
              />
            </a>
            <a
              href="#"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="קבל את זה ב-Google Play"
                className="h-12"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 bg-white rounded-3xl shadow-lg -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">98%</div>
            <div className="text-gray-600">שביעות רצון לקוחות</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">50%</div>
            <div className="text-gray-600">חיסכון בזמן ניהול</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-gray-600">תמיכה בשפה העברית</div>
          </div>
        </div>
      </section>

      {/* WhatsApp Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 md:p-12 border-2 border-green-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full mb-6">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-bold">WhatsApp Business</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  התראות ותזכורות ישירות בוואטסאפ
                </h2>
                
                <p className="text-lg text-gray-700 mb-6">
                  הלקוחות שלך יקבלו את כל ההתראות והתזכורות ישירות לוואטסאפ - אין צורך באפליקציה נוספת!
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 text-white p-2 rounded-lg flex-shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">תזכורות אוטומטיות</div>
                      <div className="text-gray-600 text-sm">תזכורת 24 שעות לפני התור</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 text-white p-2 rounded-lg flex-shrink-0">
                      <CheckCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">אישורי הזמנה</div>
                      <div className="text-gray-600 text-sm">אישור מיידי לאחר קביעת תור</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 text-white p-2 rounded-lg flex-shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">עדכונים בזמן אמת</div>
                      <div className="text-gray-600 text-sm">שינויים, ביטולים והודעות חשובות</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200">
                  {/* WhatsApp Message Mock */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      C
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Clickinder</div>
                      <div className="text-xs text-gray-500">מערכת ניהול תורים</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-green-100 rounded-2xl rounded-tr-sm p-4 mr-auto max-w-[85%]">
                      <p className="text-sm text-gray-800">
                        👋 שלום! התור שלך אצל <strong>מספרת סטייל</strong> מחר ב-<strong>14:00</strong>
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        📍 רחוב הרצל 25, תל אביב
                      </p>
                    </div>

                    <div className="bg-green-100 rounded-2xl rounded-tr-sm p-4 mr-auto max-w-[85%]">
                      <p className="text-sm text-gray-800">
                        💇‍♂️ שירות: <strong>תספורת גברים</strong>
                      </p>
                      <p className="text-sm text-gray-800 mt-1">
                        👤 מעצב: <strong>דני כהן</strong>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                        ביטול
                      </button>
                      <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                        אישור
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 text-center mt-4">
                    <MessageCircle className="w-3 h-3 inline mr-1" />
                    WhatsApp Business
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20 mt-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            למה לבחור ב-Clickinder?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            כל מה שצריך לנהל את העסק שלך ביעילות ובמקצועיות
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="לוח שנה חכם"
            description="ניהול תורים ויזואלי עם גרירה ושחרור, תצוגה יומית ושבועית"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="ניהול עובדים"
            description="הגדרת שעות עבודה ייחודיות לכל עובד, מעקב אחר זמינות"
          />
          <FeatureCard
            icon={<Building2 className="w-8 h-8" />}
            title="סניפים מרובים"
            description="נהל מספר סניפים במקום אחד עם הגדרות נפרדות לכל סניף"
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8" />}
            title="זמינות בזמן אמת"
            description="לקוחות רואים את הזמינות המדויקת ומזמינים תורים בקלות"
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="התאמה אישית מלאה"
            description="עיצוב עמוד ההזמנה, הגדרת שירותים ותבניות הודעות"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="התראות אוטומטיות"
            description="הודעות SMS, אימייל ו-WhatsApp ללקוחות בצורה אוטומטית"
          />
          <FeatureCard
            icon={<Smartphone className="w-8 h-8" />}
            title="ממשק נייד מושלם"
            description="עובד מצוין על כל מכשיר - מחשב, טאבלט או סמארטפון"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="אבטחה מלאה"
            description="הצפנת נתונים מתקדמת וגיבויים אוטומטיים"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="ניתוח ודוחות"
            description="מעקב אחר ביצועים, תובנות עסקיות והחלטות מבוססות נתונים"
          />
        </div>
      </section>

      {/* Who is it for Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            למי זה מתאים?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Clickinder מושלם לכל עסק שמבוסס על תורים וקביעת פגישות
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BusinessTypeCard 
            title="מספרות ועיצוב שיער"
            icon={<Scissors className="w-12 h-12" />}
          />
          <BusinessTypeCard 
            title="קליניקות רפואיות"
            icon={<Stethoscope className="w-12 h-12" />}
          />
          <BusinessTypeCard 
            title="מכוני יופי וספא"
            icon={<Sparkles className="w-12 h-12" />}
          />
          <BusinessTypeCard 
            title="מרפאות שיניים"
            icon={<Activity className="w-12 h-12" />}
          />
          <BusinessTypeCard 
            title="אולפני כושר אישי"
            icon={<TrendingUp className="w-12 h-12" />}
          />
          <BusinessTypeCard 
            title="יעוץ משפטי ועסקי"
            icon={<Scale className="w-12 h-12" />}
          />
          <BusinessTypeCard 
            title="בתי ספר לנהיגה"
            icon={<Car className="w-12 h-12" />}
          />
          <BusinessTypeCard 
            title="ועוד..."
            icon={<MoreHorizontal className="w-12 h-12" />}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              איך זה עובד?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              3 צעדים פשוטים להתחיל לנהל את התורים שלך
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number="1"
              title="הרשמה מהירה"
              description="צור חשבון חינם תוך פחות מדקה. ללא צורך בכרטיס אשראי."
            />
            <StepCard
              number="2"
              title="הגדר את העסק"
              description="הוסף שירותים, עובדים וסניפים. התאם את לוח הזמנים והעיצוב."
            />
            <StepCard
              number="3"
              title="שתף את הקישור"
              description="שתף את קישור ההזמנה עם הלקוחות ותתחיל לקבל תורים!"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 overflow-visible">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            תוכניות מחיר פשוטות ושקופות
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            התחל עם 30 יום ניסיון חינם - ללא כרטיס אשראי!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <PricingCard
            name="Starter"
            price="חינם"
            period="לתמיד"
            features={[
              "עד 3 עובדים",
              "סניף אחד",
              "עד 100 תורים בחודש",
              "התראות בסיסיות"
            ]}
            isFree={true}
          />
          <PricingCard
            name="Pro"
            price="₪199"
            period="לחודש"
            features={[
              "עד 10 עובדים",
              "עד 5 סניפים",
              "עד 500 תורים בחודש",
              "התראות מתקדמות",
              "אינטגרציות יומן",
              "דוחות ואנליטיקה"
            ]}
            isPopular={true}
          />
          <PricingCard
            name="Ultra"
            price="₪499"
            period="לחודש"
            features={[
              "עד 50 עובדים",
              "עד 20 סניפים",
              "עד 2000 תורים בחודש",
              "כל התכונות של Pro",
              "תמיכה מועדפת",
              "API מותאם אישית",
              "White label"
            ]}
          />
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white text-center p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-right flex-1">
                <h3 className="text-3xl font-bold mb-3 text-white">Enterprise</h3>
                <p className="text-white text-lg mb-6">
                  צריכים יותר? פתרון מותאם אישית לארגונים גדולים
                </p>
                <ul className="mt-4 space-y-3 text-base text-white">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>עובדים וסניפים ללא הגבלה</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>תמיכה 24/7 ומנהל חשבון ייעודי</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>התאמות מיוחדות והדרכה מלאה</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-1 text-white">₪999</div>
                  <div className="text-white opacity-90 text-base">לחודש</div>
                </div>
                <Link
                  href="/contact"
                  className="btn bg-white text-primary-600 hover:bg-gray-50 px-10 py-4 text-lg font-bold whitespace-nowrap shadow-xl"
                >
                  צור קשר למידע נוסף
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              מה הלקוחות שלנו אומרים
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              name="דני כהן"
              business="מספרת 'סטייל'"
              text="Clickinder שינה לי את העסק! החסכתי שעות של טלפונים ותיאומים. הלקוחות מזמינים בעצמם והכל מסודר ומאורגן."
              rating={5}
            />
            <TestimonialCard
              name="רונית לוי"
              business="קליניקה לפיזיותרפיה"
              text="המערכת קלה מאוד לשימוש והתמיכה מעולה. הלקוחות שלי אוהבים את האפשרות לקבוע תורים 24/7."
              rating={5}
            />
            <TestimonialCard
              name="אמיר בן דוד"
              business="רשת מכוני כושר"
              text="מנהל 3 סניפים דרך המערכת בקלות. הדוחות עוזרים לי להבין את הביקושים ולתכנן נכון."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            מוכנים להתחיל?
          </h2>
          <p className="text-xl md:text-2xl mb-4 opacity-90">
            הצטרפו לעסקים רבים שכבר משתמשים ב-Clickinder
          </p>
          <p className="text-lg mb-10 opacity-80">
            30 יום ניסיון חינם - ללא כרטיס אשראי - ביטול בכל עת
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            התחל את התקופת הניסיון החינמית
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>ללא כרטיס אשראי</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>התקנה מיידית</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>תמיכה בעברית</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                צור קשר
              </h2>
              <p className="text-lg text-gray-600">
                יש לך שאלות? נשמח לעזור!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="card">
                <h3 className="text-2xl font-bold mb-6">שלח לנו הודעה</h3>
                <form className="space-y-4">
                  <div>
                    <label className="form-label">שם מלא</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="הכנס את שמך המלא"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">אימייל</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">טלפון</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="050-1234567"
                    />
                  </div>
                  <div>
                    <label className="form-label">הודעה</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      placeholder="ספר לנו איך נוכל לעזור..."
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>שלח הודעה</span>
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-2xl font-bold mb-6">פרטי התקשרות</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">אימייל</div>
                        <a href="mailto:support@clickinder.co.il" className="text-primary-600 hover:underline">
                          support@clickinder.co.il
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">טלפון</div>
                        <a href="tel:+972501234567" className="text-primary-600 hover:underline">
                          050-123-4567
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">כתובת</div>
                        <p className="text-gray-600">
                          רחוב ההי-טק 1<br />
                          תל אביב, ישראל
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-primary-50 border-primary-200">
                  <h4 className="font-bold text-lg mb-3">שעות פעילות</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ראשון - חמישי</span>
                      <span className="font-semibold">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">שישי</span>
                      <span className="font-semibold">9:00 - 13:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">שבת</span>
                      <span className="font-semibold">סגור</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <img
                src="/assets/logo.png"
                alt="Clickinder"
                className="h-8 mb-4 brightness-0 invert"
              />
              <p className="text-sm mb-4">
                פלטפורמת ניהול תורים מתקדמת לעסקים בישראל
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img
                    src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/white/he-il?size=250x83&releaseDate=1316044800"
                    alt="הורד מ-App Store"
                    className="h-10"
                  />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity inline-block">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="קבל את זה ב-Google Play"
                    className="h-10 brightness-200"
                  />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-white mb-4">המוצר</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">יכולות</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">מחירים</a></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">התחל חינם</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">דמו</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-4">החברה</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">אודות</a></li>
                <li><a href="#" className="hover:text-white transition-colors">בלוג</a></li>
                <li><a href="#" className="hover:text-white transition-colors">קריירה</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">צור קשר</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-4">משפטי</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">תנאי שימוש</a></li>
                <li><a href="#" className="hover:text-white transition-colors">מדיניות פרטיות</a></li>
                <li><a href="#" className="hover:text-white transition-colors">עוגיות</a></li>
                <li><a href="#" className="hover:text-white transition-colors">נגישות</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 Clickinder. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function BusinessTypeCard({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card text-center hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
      <div className="text-primary-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full text-2xl font-bold mb-6 shadow-lg">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  isPopular,
  isFree,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isFree?: boolean;
}) {
  return (
    <div 
      className={`card relative ${isPopular ? 'ring-2 ring-primary-600 shadow-2xl transform scale-105' : ''}`}
      style={isPopular ? { overflow: 'unset' } : {}}
    >
      {isPopular && (
        <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
          הכי פופולרי
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="flex items-end justify-center gap-1 mb-2">
          <span className="text-4xl font-bold text-primary-600">{price}</span>
          <span className="text-gray-600 mb-1">{period}</span>
        </div>
        {isFree && (
          <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            30 יום חינם
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/auth/register"
        className={`btn w-full ${isPopular ? 'btn-primary' : 'btn-secondary'}`}
      >
        התחל עכשיו
      </Link>
    </div>
  );
}

function TestimonialCard({
  name,
  business,
  text,
  rating,
}: {
  name: string;
  business: string;
  text: string;
  rating: number;
}) {
  return (
    <div className="card bg-white">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">&quot;{text}&quot;</p>
      <div>
        <div className="font-bold text-gray-900">{name}</div>
        <div className="text-sm text-gray-600">{business}</div>
      </div>
    </div>
  );
}

